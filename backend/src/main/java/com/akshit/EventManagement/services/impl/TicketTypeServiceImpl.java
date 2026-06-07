package com.akshit.EventManagement.services.impl;

import com.akshit.EventManagement.domain.entity.QrCode;
import com.akshit.EventManagement.domain.entity.Ticket;
import com.akshit.EventManagement.domain.entity.TicketType;
import com.akshit.EventManagement.domain.entity.User;
import com.akshit.EventManagement.domain.enums.TicketStatusEnum;
import com.akshit.EventManagement.exceptions.EventNotFoundException;
import com.akshit.EventManagement.exceptions.TicketTypeNotFoundException;
import com.akshit.EventManagement.exceptions.TicketsSoldOutException;
import com.akshit.EventManagement.exceptions.UserNotFoundException;
import com.akshit.EventManagement.notifications.NotificationDispatcher;
import com.akshit.EventManagement.notifications.TicketConfirmationData;
import com.akshit.EventManagement.repositories.QrCodeRepository;
import com.akshit.EventManagement.repositories.TicketRepository;
import com.akshit.EventManagement.repositories.TicketTypeRepository;
import com.akshit.EventManagement.repositories.UserRepository;
import com.akshit.EventManagement.services.QrCodeService;
import com.akshit.EventManagement.services.TicketTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketTypeServiceImpl implements TicketTypeService {

    private final UserRepository         userRepository;
    private final TicketTypeRepository   ticketTypeRepository;
    private final TicketRepository       ticketRepository;
    private final QrCodeRepository       qrCodeRepository;
    private final QrCodeService          qrCodeService;
    private final NotificationDispatcher notificationDispatcher;

    @Override
    @Transactional
    public Ticket purchaseTicket(UUID userId, UUID eventId, UUID ticketTypeId) {

        // 1 — Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(
                        "User with ID %s was not found".formatted(userId)));

        // 2 — Fetch ticket type with pessimistic write-lock to prevent overselling
        TicketType ticketType = ticketTypeRepository.findByIdWithLock(ticketTypeId)
                .orElseThrow(() -> new TicketTypeNotFoundException(
                        "Ticket type with ID %s was not found".formatted(ticketTypeId)));

        // 3 — Validate that the ticket type belongs to the requested event
        if (!ticketType.getEvent().getId().equals(eventId)) {
            throw new EventNotFoundException(
                    "Ticket type %s does not belong to event %s".formatted(ticketTypeId, eventId));
        }

        // 4 — Availability check (only counts PURCHASED, excludes CANCELLED)
        int sold = ticketRepository.countActiveByTicketTypeId(ticketType.getId());
        if (sold + 1 > ticketType.getTotalAvailable()) {
            throw new TicketsSoldOutException();
        }

        // 5 — Create and persist ticket
        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatusEnum.PURCHASED);
        ticket.setTicketType(ticketType);
        ticket.setPurchaser(user);
        Ticket savedTicket = ticketRepository.save(ticket);

        // 6 — Generate and persist QR code
        QrCode qrCode = qrCodeService.generateQrCode(savedTicket);

        // 7 — Decode QR PNG bytes for notifications (base64 stored in DB)
        byte[] qrBytes = Base64.getDecoder().decode(qrCode.getValue());

        log.info("Ticket purchased: ticketId={} userId={} ticketTypeId={}",
                savedTicket.getId(), userId, ticketTypeId);

        // 8 — Dispatch email notification asynchronously.......
        TicketConfirmationData confirmationData = TicketConfirmationData.builder()
                .attendeeName(user.getName())
                .attendeeEmail(user.getEmail())
                .ticketId(savedTicket.getId())
                .ticketTypeName(ticketType.getName())
                .ticketPrice(ticketType.getPrice())
                .eventName(ticketType.getEvent().getName())
                .eventVenue(ticketType.getEvent().getVenue())
                .eventStart(ticketType.getEvent().getStart())
                .eventEnd(ticketType.getEvent().getEnd())
                .qrCodeBytes(qrBytes)
                .build();

        notificationDispatcher.dispatch(confirmationData);

        return savedTicket;
    }
}
