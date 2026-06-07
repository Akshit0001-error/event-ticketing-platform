package com.akshit.EventManagement.notifications;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record TicketConfirmationData(

        // Attendee
        String attendeeName,
        String attendeeEmail,

        // Ticket
        UUID   ticketId,
        String ticketTypeName,
        double ticketPrice,

        // Event
        String        eventName,
        String        eventVenue,
        LocalDateTime eventStart,
        LocalDateTime eventEnd,

        // QR code — raw PNG
        byte[] qrCodeBytes

) {}
