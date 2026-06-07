package com.akshit.EventManagement.controller;

import com.akshit.EventManagement.domain.dto.details.CancellationResponseDto;
import com.akshit.EventManagement.domain.dto.details.GetTicketResponseDto;
import com.akshit.EventManagement.domain.dto.list.ListTicketResponseDto;
import com.akshit.EventManagement.domain.entity.Ticket;
import com.akshit.EventManagement.domain.enums.TicketStatusEnum;
import com.akshit.EventManagement.mapper.TicketMapper;
import com.akshit.EventManagement.services.QrCodeService;
import com.akshit.EventManagement.services.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.akshit.EventManagement.utils.JwtUtil.getUserId;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService  ticketService;
    private final TicketMapper   ticketMapper;
    private final QrCodeService  qrCodeService;

    /** List all tickets purchased by the authenticated user (paginated). */
    @GetMapping
    public Page<ListTicketResponseDto> listTickets(
            Authentication authentication,
            Pageable pageable
    ) {
        return ticketService
                .listTicketsForUser(getUserId(authentication), pageable)
                .map(ticketMapper::toListTicketResponseDto);
    }

    /** Get full details of one ticket owned by the authenticated user. */
    @GetMapping("/{ticketId}")
    public ResponseEntity<GetTicketResponseDto> getTicket(
            Authentication authentication,
            @PathVariable UUID ticketId
    ) {
        return ticketService
                .getTicketForUser(getUserId(authentication), ticketId)
                .map(ticketMapper::toGetTicketResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Download the QR code PNG for a ticket owned by the authenticated user. */
    @GetMapping("/{ticketId}/qr-codes")
    public ResponseEntity<byte[]> getTicketQrCode(
            Authentication authentication,
            @PathVariable UUID ticketId
    ) {
        byte[] qrCodeImage = qrCodeService
                .getQrCodeImageForUserAndTicket(getUserId(authentication), ticketId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qrCodeImage.length);
        return ResponseEntity.ok().headers(headers).body(qrCodeImage);
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<CancellationResponseDto> cancelTicket(
            Authentication authentication,
            @PathVariable UUID ticketId
    ) {
        Ticket cancelled = ticketService.cancelTicket(getUserId(authentication), ticketId);

        return ResponseEntity.ok(new CancellationResponseDto(
                cancelled.getId(),
                TicketStatusEnum.CANCELLED,
                "Your ticket has been cancelled. "
                + "For refund enquiries, please contact the event organiser directly."
        ));
    }
}
