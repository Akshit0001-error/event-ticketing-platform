package com.akshit.EventManagement.services.impl;

import com.akshit.EventManagement.domain.entity.QrCode;
import com.akshit.EventManagement.domain.entity.Ticket;
import com.akshit.EventManagement.domain.enums.QrCodeStatusEnum;
import com.akshit.EventManagement.domain.enums.TicketStatusEnum;
import com.akshit.EventManagement.exceptions.TicketCancellationException;
import com.akshit.EventManagement.exceptions.TicketNotFoundException;
import com.akshit.EventManagement.repositories.QrCodeRepository;
import com.akshit.EventManagement.repositories.TicketRepository;
import com.akshit.EventManagement.services.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepository  ticketRepository;
    private final QrCodeRepository  qrCodeRepository;

    @Value("${app.cancellation.min-hours-before-event:24}")
    private int minHoursBeforeEvent;

    // ── Read operations

    @Override
    @Transactional(readOnly = true)
    public Page<Ticket> listTicketsForUser(UUID userId, Pageable pageable) {
        return ticketRepository.findByPurchaserId(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ticket> getTicketForUser(UUID userId, UUID ticketId) {
        return ticketRepository.findByIdAndPurchaserId(ticketId, userId);
    }

    // ── Cancellation

    @Override
    @Transactional
    public Ticket cancelTicket(UUID userId, UUID ticketId) {


        Ticket ticket = ticketRepository.findByIdAndPurchaserId(ticketId, userId)
                .orElseThrow(() -> new TicketNotFoundException(
                        "Ticket %s not found".formatted(ticketId)));

        if (ticket.getStatus() == TicketStatusEnum.CANCELLED) {
            throw new TicketCancellationException("This ticket has already been cancelled.");
        }

        LocalDateTime eventStart = ticket.getTicketType().getEvent().getStart();
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

        if (!now.isBefore(eventStart)) {
            throw new TicketCancellationException(
                    "Cancellation is not allowed after the event has started.");
        }

        LocalDateTime deadline = eventStart.minusHours(minHoursBeforeEvent);
        if (!now.isBefore(deadline)) {
            throw new TicketCancellationException(
                    "Cancellation window has closed. Tickets must be cancelled at least "
                    + minHoursBeforeEvent + " hour(s) before the event starts.");
        }

        ticket.setStatus(TicketStatusEnum.CANCELLED);
        Ticket cancelled = ticketRepository.save(ticket);

        List<QrCode> qrCodes = qrCodeRepository.findAllByTicketId(ticketId);
        qrCodes.forEach(qr -> qr.setStatus(QrCodeStatusEnum.REVOKED));
        qrCodeRepository.saveAll(qrCodes);

        log.info("Ticket {} cancelled by user {} — {} QR code(s) revoked",
                ticketId, userId, qrCodes.size());

        return cancelled;
    }
}
