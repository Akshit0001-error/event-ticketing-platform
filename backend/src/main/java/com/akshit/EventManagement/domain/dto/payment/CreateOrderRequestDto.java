package com.akshit.EventManagement.domain.dto.payment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateOrderRequestDto(

        @NotNull(message = "Ticket type ID is required")
        UUID ticketTypeId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1,  message = "Minimum 1 ticket")
        @Max(value = 10, message = "Maximum 10 tickets per purchase")
        Integer quantity
) {}
