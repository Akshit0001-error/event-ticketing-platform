package com.akshit.EventManagement.domain.dto.details;

import com.akshit.EventManagement.domain.enums.TicketStatusEnum;

import java.util.UUID;

public record CancellationResponseDto(
        UUID   ticketId,
        TicketStatusEnum status,
        String message
) {}
