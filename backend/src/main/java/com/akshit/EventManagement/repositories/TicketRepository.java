package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.Ticket;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,UUID> {

    //int countByTicketTypeId(UUID ticketTypeId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.ticketType.id = :ticketTypeId AND t.status = 'PURCHASED'")
    int countActiveByTicketTypeId(UUID ticketTypeId);

    @EntityGraph(attributePaths = {"ticketType"})
    Page<Ticket> findByPurchaserId(UUID purchaserId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "ticketType",
            "ticketType.event"
    })
    Optional<Ticket> findByIdAndPurchaserId(UUID id, UUID purchaserId);

}
