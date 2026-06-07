package com.akshit.EventManagement.services.impl;

import com.akshit.EventManagement.domain.CreateEventRequest;
import com.akshit.EventManagement.domain.UpdateEventRequest;
import com.akshit.EventManagement.domain.UpdateTicketTypeRequest;
import com.akshit.EventManagement.domain.entity.Event;
import com.akshit.EventManagement.domain.entity.TicketType;
import com.akshit.EventManagement.domain.entity.User;
import com.akshit.EventManagement.domain.enums.EventStatusEnum;
import com.akshit.EventManagement.exceptions.EventNotFoundException;
import com.akshit.EventManagement.exceptions.EventTicketException;
import com.akshit.EventManagement.exceptions.EventUpdateException;
import com.akshit.EventManagement.exceptions.TicketTypeNotFoundException;
import com.akshit.EventManagement.exceptions.UserNotFoundException;
import com.akshit.EventManagement.repositories.EventRepository;
import com.akshit.EventManagement.repositories.TicketRepository;
import com.akshit.EventManagement.repositories.UserRepository;
import com.akshit.EventManagement.services.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final UserRepository   userRepository;
    private final EventRepository  eventRepository;
    private final TicketRepository ticketRepository;

    // ── Write operations

    @Override
    @Transactional
    public Event createEvent(UUID organizerId, CreateEventRequest event) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new UserNotFoundException(
                        "User with ID '%s' not found".formatted(organizerId)));

        Event eventToCreate = new Event();

        List<TicketType> ticketTypes = event.getTicketTypes().stream().map(tt -> {
            TicketType type = new TicketType();
            type.setName(tt.getName());
            type.setPrice(tt.getPrice());
            type.setDescription(tt.getDescription());
            type.setTotalAvailable(tt.getTotalAvailable());
            type.setEvent(eventToCreate);
            return type;
        }).toList();

        eventToCreate.setName(event.getName());
        eventToCreate.setStart(event.getStart());
        eventToCreate.setEnd(event.getEnd());
        eventToCreate.setVenue(event.getVenue());
        eventToCreate.setSalesStart(event.getSalesStart());
        eventToCreate.setSalesEnd(event.getSalesEnd());
        eventToCreate.setStatus(event.getStatus());
        eventToCreate.setBannerImage(event.getBannerImage());
        eventToCreate.setOrganizer(organizer);
        eventToCreate.setTicketTypes(ticketTypes);

        return eventRepository.save(eventToCreate);
    }

    @Override
    @Transactional
    public Event updateEventOrganizer(UUID organizerId, UUID id, UpdateEventRequest event) {
        if (event.getId() == null) {
            throw new EventUpdateException("Event ID cannot be null in the request body");
        }
        if (!id.equals(event.getId())) {
            throw new EventUpdateException("Path ID and body ID do not match");
        }

        Event existing = eventRepository.findByIdAndOrganizerId(id, organizerId)
                .orElseThrow(() -> new EventNotFoundException(
                        "Event '%s' not found or you do not have access".formatted(id)));

        existing.setName(event.getName());
        existing.setStart(event.getStart());
        existing.setEnd(event.getEnd());
        existing.setVenue(event.getVenue());
        existing.setSalesStart(event.getSalesStart());
        existing.setSalesEnd(event.getSalesEnd());
        existing.setStatus(event.getStatus());
        existing.setBannerImage(event.getBannerImage());


        Set<UUID> requestIds = event.getTicketTypes().stream()
                .map(UpdateTicketTypeRequest::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        existing.getTicketTypes().removeIf(existingType -> {
            if (!requestIds.contains(existingType.getId())) {
                int sold = ticketRepository.countActiveByTicketTypeId(existingType.getId());
                if (sold > 0) {
                    throw new EventTicketException(
                            "Cannot remove ticket type '%s': %d ticket(s) already sold."
                                    .formatted(existingType.getName(), sold));
                }
                return true;
            }
            return false;
        });

        Map<UUID, TicketType> existingIndex = new HashMap<>();
        for (TicketType tt : existing.getTicketTypes()) {
            existingIndex.put(tt.getId(), tt);
        }
        for (UpdateTicketTypeRequest req : event.getTicketTypes()) {
            if (req.getId() == null) {
                // New ticket type
                TicketType newType = new TicketType();
                newType.setName(req.getName());
                newType.setPrice(req.getPrice());
                newType.setDescription(req.getDescription());
                newType.setTotalAvailable(req.getTotalAvailable());
                newType.setEvent(existing);
                existing.getTicketTypes().add(newType);
            } else if (existingIndex.containsKey(req.getId())) {
                // Existing ticket type — update it
                TicketType tt = existingIndex.get(req.getId());
                tt.setName(req.getName());
                tt.setPrice(req.getPrice());
                tt.setDescription(req.getDescription());
                tt.setTotalAvailable(req.getTotalAvailable());
            } else {
                throw new TicketTypeNotFoundException(
                        "Ticket type '%s' does not exist on this event".formatted(req.getId()));
            }
        }

        return eventRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteEventForOrganizer(UUID organizerId, UUID id) {
        Event event = getEventForOrganizer(organizerId, id)
                .orElseThrow(() -> new EventNotFoundException(
                        "Event '%s' not found or you do not have access".formatted(id)));
        eventRepository.delete(event);
    }

    // ── Read operations

    @Override
    @Transactional(readOnly = true)
    public Page<Event> listEventForOrganizer(UUID organizerId, Pageable pageable) {
        // Step 1: paginated ID query — correct LIMIT/OFFSET at DB level
        Page<UUID> idPage = eventRepository.findIdsByOrganizerId(organizerId, pageable);
        if (idPage.isEmpty()) return idPage.map(id -> null);
        // Step 2: batch JOIN FETCH ticketTypes only for this page's IDs
        List<Event> events = eventRepository.findByIdsWithTicketTypes(idPage.getContent());
        return new org.springframework.data.domain.PageImpl<>(events, pageable, idPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Event> getEventForOrganizer(UUID organizerId, UUID id) {
        return eventRepository.findByIdAndOrganizerId(id, organizerId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Event> listPublishedEvents(Pageable pageable) {
        // Step 1: paginated ID query — correct LIMIT/OFFSET at DB level
        Page<UUID> idPage = eventRepository.findIdsByStatus(EventStatusEnum.PUBLISHED, pageable);
        if (idPage.isEmpty()) return idPage.map(id -> null);
        // Step 2: batch JOIN FETCH ticketTypes only for this page's IDs
        List<Event> events = eventRepository.findByIdsWithTicketTypes(idPage.getContent());
        return new org.springframework.data.domain.PageImpl<>(events, pageable, idPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Event> searchPublishedEvents(String query, Pageable pageable) {
        // Native FTS query returns IDs; we then JOIN FETCH ticketTypes by those IDs
        Page<Event> nativePage = eventRepository.searchEvents(query, pageable);
        if (nativePage.isEmpty()) return nativePage;

        List<UUID> ids = nativePage.getContent().stream()
                .map(com.akshit.EventManagement.domain.entity.Event::getId)
                .toList();
        List<Event> fetched = eventRepository.findByIdsWithTicketTypes(ids);

        Map<UUID, Event> byId = new java.util.LinkedHashMap<>();
        fetched.forEach(e -> byId.put(e.getId(), e));
        List<Event> ordered = ids.stream().map(byId::get).filter(java.util.Objects::nonNull).toList();

        return new PageImpl<>(ordered, pageable, nativePage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Event> getPublishedEvent(UUID id) {
        return eventRepository.findByIdAndStatus(id, EventStatusEnum.PUBLISHED);
    }
}
