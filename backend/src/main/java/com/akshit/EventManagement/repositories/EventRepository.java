package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.Event;
import com.akshit.EventManagement.domain.enums.EventStatusEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {


    long countByOrganizerId(UUID organizerId);

    long countByStatus(EventStatusEnum status);


    @Query("SELECT e.id FROM Event e WHERE e.organizer.id = :organizerId")
    Page<UUID> findIdsByOrganizerId(@Param("organizerId") UUID organizerId, Pageable pageable);

    @Query("SELECT e.id FROM Event e WHERE e.status = :status")
    Page<UUID> findIdsByStatus(@Param("status") EventStatusEnum status, Pageable pageable);

    @Query("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.ticketTypes WHERE e.id IN :ids")
    List<Event> findByIdsWithTicketTypes(@Param("ids") List<UUID> ids);


    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.ticketTypes WHERE e.id = :id AND e.organizer.id = :organizerId")
    Optional<Event> findByIdAndOrganizerId(@Param("id") UUID id, @Param("organizerId") UUID organizerId);

    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.ticketTypes WHERE e.id = :id AND e.status = :status")
    Optional<Event> findByIdAndStatus(@Param("id") UUID id, @Param("status") EventStatusEnum status);

    // Full-text search

    @Query(value = "SELECT * FROM events WHERE " +
            "status = 'PUBLISHED' AND " +
            "to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(venue, '')) " +
            "@@ plainto_tsquery('english', :searchTerm)",
            countQuery = "SELECT count(*) FROM events WHERE " +
                    "status = 'PUBLISHED' AND " +
                    "to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(venue, '')) " +
                    "@@ plainto_tsquery('english', :searchTerm)",
            nativeQuery = true)
    Page<Event> searchEvents(@Param("searchTerm") String searchTerm, Pageable pageable);
}
