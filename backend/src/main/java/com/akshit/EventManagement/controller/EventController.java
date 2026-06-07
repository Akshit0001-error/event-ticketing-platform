package com.akshit.EventManagement.controller;

import com.akshit.EventManagement.domain.CreateEventRequest;
import com.akshit.EventManagement.domain.UpdateEventRequest;
import com.akshit.EventManagement.domain.dto.create.CreateEventDto;
import com.akshit.EventManagement.domain.dto.create.CreateEventResponseDto;
import com.akshit.EventManagement.domain.dto.details.GetEventDetailsResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListEventResponseDto;
import com.akshit.EventManagement.domain.dto.update.UpdateEventDto;
import com.akshit.EventManagement.domain.dto.update.UpdateEventResponseDto;
import com.akshit.EventManagement.domain.entity.Event;
import com.akshit.EventManagement.mapper.EventMapper;
import com.akshit.EventManagement.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.akshit.EventManagement.utils.JwtUtil.getUserId;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventMapper  eventMapper;
    private final EventService eventService;

    /** Create a new event owned by the authenticated organizer. */
    @PostMapping
    public ResponseEntity<CreateEventResponseDto> createEvent(
            Authentication authentication,
            @Valid @RequestBody CreateEventDto createEventDto
    ) {
        CreateEventRequest request = eventMapper.fromDto(createEventDto);
        Event created = eventService.createEvent(getUserId(authentication), request);
        return new ResponseEntity<>(eventMapper.toDto(created), HttpStatus.CREATED);
    }

    /** Update an existing event owned by the authenticated organizer. */
    @PutMapping("/{eventId}")
    public ResponseEntity<UpdateEventResponseDto> updateEvent(
            Authentication authentication,
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventDto updateEventDto
    ) {
        UpdateEventRequest request = eventMapper.fromDto(updateEventDto);
        Event updated = eventService.updateEventOrganizer(getUserId(authentication), eventId, request);
        return ResponseEntity.ok(eventMapper.toUpdateEventResponseDto(updated));
    }

    /** List all events owned by the authenticated organizer (paginated). */
    @GetMapping
    public ResponseEntity<Page<ListEventResponseDto>> listEvent(
            Authentication authentication,
            Pageable pageable
    ) {
        Page<Event> events = eventService.listEventForOrganizer(getUserId(authentication), pageable);
        return ResponseEntity.ok(events.map(eventMapper::toListEventResponseDto));
    }

    /** Get full details of a specific event owned by the authenticated organizer. */
    @GetMapping("/{eventId}")
    public ResponseEntity<GetEventDetailsResponseDto> getEvent(
            Authentication authentication,
            @PathVariable UUID eventId
    ) {
        return eventService.getEventForOrganizer(getUserId(authentication), eventId)
                .map(eventMapper::toGetEventDetailsResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Delete an event owned by the authenticated organizer. */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            Authentication authentication,
            @PathVariable UUID eventId
    ) {
        eventService.deleteEventForOrganizer(getUserId(authentication), eventId);
        return ResponseEntity.noContent().build();
    }
}
