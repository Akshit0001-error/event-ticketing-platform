package com.akshit.EventManagement.domain.dto.payment;

public record CreateOrderResponseDto(
        String orderId,
        long   amountInPaise,   // total = price × quantity × 100
        String currency,
        String keyId,
        String ticketTypeName,
        Double pricePerTicket,
        Integer quantity
) {}
