package com.akshit.EventManagement.services;

import com.akshit.EventManagement.domain.entity.QrCode;
import com.akshit.EventManagement.domain.entity.Ticket;

import java.util.UUID;

public interface QrCodeService {

    QrCode generateQrCode(Ticket ticket);

    byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId);
}
