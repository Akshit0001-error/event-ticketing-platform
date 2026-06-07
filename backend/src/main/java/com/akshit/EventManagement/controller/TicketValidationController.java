package com.akshit.EventManagement.controller;

import com.akshit.EventManagement.domain.dto.valid.TicketValidationRequestDto;
import com.akshit.EventManagement.domain.dto.valid.TicketValidationResponseDto;
import com.akshit.EventManagement.domain.entity.TicketValidation;
import com.akshit.EventManagement.domain.enums.TicketValidationMethodEnum;
import com.akshit.EventManagement.mapper.TicketValidationMapper;
import com.akshit.EventManagement.services.TicketValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

/**
 * Handles ticket validation at the event gate.
 */
@RestController
@RequestMapping(path = "/api/v1/ticket-validations")
@RequiredArgsConstructor
@Slf4j
public class TicketValidationController {
    private final TicketValidationService ticketValidationService;
    private final TicketValidationMapper ticketValidationMapper;
    @PostMapping
    public ResponseEntity<TicketValidationResponseDto> validateTicket(
            @Valid @RequestBody TicketValidationRequestDto ticketValidationRequestDto
    ){
        TicketValidationMethodEnum method = ticketValidationRequestDto.getMethod();
        TicketValidation ticketValidation;
        if(TicketValidationMethodEnum.MANUAL.equals(method)) {
            ticketValidation = ticketValidationService.validateTicketManually(
                    ticketValidationRequestDto.getId());
        } else {
            ticketValidation = ticketValidationService.validateTicketByQrCode(
                    ticketValidationRequestDto.getId()
            );
        }
        return ResponseEntity.ok(
                ticketValidationMapper.toTicketValidationResponseDto(ticketValidation)
        );
    }
}
