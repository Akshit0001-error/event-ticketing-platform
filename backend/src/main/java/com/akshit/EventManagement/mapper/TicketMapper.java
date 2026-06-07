package com.akshit.EventManagement.mapper;

import com.akshit.EventManagement.domain.dto.details.GetTicketResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListTicketResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListTicketTicketTypeResponseDto;
import com.akshit.EventManagement.domain.entity.Ticket;
import com.akshit.EventManagement.domain.entity.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TicketMapper {


     //Maps TicketType entity to its list response DTO.
    ListTicketTicketTypeResponseDto toListTicketTicketTypeResponseDto(TicketType ticketType);


     //Maps Ticket entity to its list response DTO.

    ListTicketResponseDto toListTicketResponseDto(Ticket ticket);

    @Mapping(target = "price", source = "ticket.ticketType.price")
    @Mapping(target = "description", source = "ticket.ticketType.description")
    @Mapping(target = "eventName", source = "ticket.ticketType.event.name")
    @Mapping(target = "eventVenue", source = "ticket.ticketType.event.venue")
    @Mapping(target = "eventStart", source = "ticket.ticketType.event.start")
    @Mapping(target = "eventEnd", source = "ticket.ticketType.event.end")
    GetTicketResponseDto toGetTicketResponseDto(Ticket ticket);
}