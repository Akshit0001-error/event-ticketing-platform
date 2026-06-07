package com.akshit.EventManagement.services;

import com.akshit.EventManagement.domain.entity.Ticket;

import java.util.UUID;

public interface TicketTypeService {

    Ticket purchaseTicket(UUID userId, UUID eventId, UUID ticketTypeId);
}
