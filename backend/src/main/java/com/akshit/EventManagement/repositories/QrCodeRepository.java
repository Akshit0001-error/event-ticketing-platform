package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.QrCode;
import com.akshit.EventManagement.domain.enums.QrCodeStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, UUID> {

    Optional<QrCode> findByTicketIdAndTicketPurchaserId(UUID ticketId, UUID ticketPurchaserId);

    List<QrCode> findAllByTicketId(UUID ticketId);
}
