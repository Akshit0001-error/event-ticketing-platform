package com.akshit.EventManagement.services.impl;

import com.akshit.EventManagement.domain.entity.QrCode;
import com.akshit.EventManagement.domain.entity.Ticket;
import com.akshit.EventManagement.domain.entity.TicketValidation;
import com.akshit.EventManagement.domain.enums.QrCodeStatusEnum;
import com.akshit.EventManagement.domain.enums.TicketStatusEnum;
import com.akshit.EventManagement.domain.enums.TicketValidationMethodEnum;
import com.akshit.EventManagement.domain.enums.TicketValidationStatusEnum;
import com.akshit.EventManagement.exceptions.QrCodeNotFoundException;
import com.akshit.EventManagement.exceptions.TicketCancellationException;
import com.akshit.EventManagement.exceptions.TicketNotFoundException;
import com.akshit.EventManagement.repositories.QrCodeRepository;
import com.akshit.EventManagement.repositories.TicketRepository;
import com.akshit.EventManagement.repositories.TicketValidationRepository;
import com.akshit.EventManagement.services.TicketValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketValidationServiceImpl implements TicketValidationService {

    private final QrCodeRepository           qrCodeRepository;
    private final TicketValidationRepository  ticketValidationRepository;
    private final TicketRepository            ticketRepository;

    @Override
    public TicketValidation validateTicketByQrCode(UUID qrCodeId) {

        // Fetch QR code regardless of status — we need to give a specific error
        // for REVOKED codes rather than a generic "not found"
        QrCode qrCode = qrCodeRepository.findById(qrCodeId)
                .orElseThrow(() -> new QrCodeNotFoundException(
                        "QR Code %s was not found".formatted(qrCodeId)));

        // REVOKED = ticket was cancelled; give staff a clear message at the gate
        if (qrCode.getStatus() == QrCodeStatusEnum.REVOKED) {
            log.warn("Gate scan rejected — QR code {} belongs to a cancelled ticket", qrCodeId);
            throw new TicketCancellationException(
                    "This ticket has been cancelled and is no longer valid for entry.");
        }

        // EXPIRED or any other non-ACTIVE status
        if (qrCode.getStatus() != QrCodeStatusEnum.ACTIVE) {
            throw new QrCodeNotFoundException(
                    "QR Code %s is no longer active".formatted(qrCodeId));
        }

        return validateTicket(qrCode.getTicket(), TicketValidationMethodEnum.QR_SCAN);
    }

    @Override
    public TicketValidation validateTicketManually(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(TicketNotFoundException::new);

        // Block manual validation of cancelled tickets too
        if (ticket.getStatus() == TicketStatusEnum.CANCELLED) {
            throw new TicketCancellationException(
                    "Ticket %s has been cancelled and cannot be manually validated."
                    .formatted(ticketId));
        }

        return validateTicket(ticket, TicketValidationMethodEnum.MANUAL);
    }


    private TicketValidation validateTicket(Ticket ticket, TicketValidationMethodEnum method) {
        TicketValidation ticketValidation = new TicketValidation();
        ticketValidation.setTicket(ticket);
        ticketValidation.setValidationMethod(method);

        // Single COUNT query — avoids lazy-loading the entire validations
        boolean alreadyUsed = ticketValidationRepository.existsByTicketIdAndStatus(
                ticket.getId(), TicketValidationStatusEnum.VALID);

        ticketValidation.setStatus(alreadyUsed
                ? TicketValidationStatusEnum.INVALID
                : TicketValidationStatusEnum.VALID);

        return ticketValidationRepository.save(ticketValidation);
    }
}
