package com.akshit.EventManagement.mapper;

import com.akshit.EventManagement.domain.CreateEventRequest;
import com.akshit.EventManagement.domain.CreateTicketType;
import com.akshit.EventManagement.domain.UpdateEventRequest;
import com.akshit.EventManagement.domain.UpdateTicketTypeRequest;
import com.akshit.EventManagement.domain.dto.create.CreateEventDto;
import com.akshit.EventManagement.domain.dto.create.CreateEventResponseDto;
import com.akshit.EventManagement.domain.dto.create.CreateTicketTypeDto;
import com.akshit.EventManagement.domain.dto.details.GetEventDetailsResponseDto;
import com.akshit.EventManagement.domain.dto.details.GetEventTicketTypeResponseDto;
import com.akshit.EventManagement.domain.dto.details.GetPublishedEventDetailsResponseDto;
import com.akshit.EventManagement.domain.dto.details.GetPublishedEventTicketTypeResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListEventResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListEventTicketTypeResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListPublishedEventResponseDto;
import com.akshit.EventManagement.domain.dto.update.UpdateEventDto;
import com.akshit.EventManagement.domain.dto.update.UpdateEventResponseDto;
import com.akshit.EventManagement.domain.dto.update.UpdateTicketTypeDto;
import com.akshit.EventManagement.domain.dto.update.UpdateTicketTypeResponseDto;
import com.akshit.EventManagement.domain.entity.Event;
import com.akshit.EventManagement.domain.entity.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface EventMapper {

    /* ============================
       CREATE MAPPINGS
       ============================ */

    // Create Event flow
    CreateEventRequest fromDto(CreateEventDto dto);
    CreateEventResponseDto toDto(Event event);

    // Create Ticket Type flow
    CreateTicketType fromDto(CreateTicketTypeDto dto);


    /* ============================
       LIST / SUMMARY MAPPINGS
       ============================ */

    // Organizer side event listing
    ListEventResponseDto toListEventResponseDto(Event event);

    // Organizer side ticket type listing
    ListEventTicketTypeResponseDto toDto(TicketType ticketType);

    // Public published events listing
    ListPublishedEventResponseDto toListPublishedEventResponseDto(Event event);


    /* ============================
       GET DETAILS MAPPINGS
       ============================ */

    // Organizer side event details
    GetEventDetailsResponseDto toGetEventDetailsResponseDto(Event event);

    // Organizer side ticket type details
    GetEventTicketTypeResponseDto toGetEventTicketTypeResponseDto(TicketType ticketType);

    // Public published event details
    GetPublishedEventDetailsResponseDto toGetPublishedEventDetailsResponseDto(Event event);

    // Public published ticket type details
    GetPublishedEventTicketTypeResponseDto toGetPublishedEventTicketTypeResponseDto(TicketType ticketType);


    /* ============================
       UPDATE MAPPINGS
       ============================ */

    // Update Event flow
    UpdateEventRequest fromDto(UpdateEventDto dto);
    UpdateEventResponseDto toUpdateEventResponseDto(Event event);

    // Update Ticket Type flow
    UpdateTicketTypeRequest fromDto(UpdateTicketTypeDto dto);
    UpdateTicketTypeResponseDto toUpdateTicketTypeResponseDto(TicketType ticketType);
}
