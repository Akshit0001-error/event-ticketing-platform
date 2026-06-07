package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.TicketValidation;
import com.akshit.EventManagement.domain.enums.TicketValidationStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TicketValidationRepository extends JpaRepository<TicketValidation, UUID> {

    boolean existsByTicketIdAndStatus(UUID ticketId, TicketValidationStatusEnum status);
}
