package com.akshit.EventManagement.domain.dto.payment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VerifyPaymentRequestDto(

        @NotBlank(message = "Razorpay order ID is required")
        String razorpayOrderId,

        @NotBlank(message = "Razorpay payment ID is required")
        String razorpayPaymentId,

        @NotBlank(message = "Razorpay signature is required")
        String razorpaySignature,

        @NotNull(message = "Event ID is required")
        UUID eventId,

        @NotNull(message = "Ticket type ID is required")
        UUID ticketTypeId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1,  message = "Minimum 1 ticket")
        @Max(value = 10, message = "Maximum 10 tickets per purchase")
        Integer quantity
) {}
