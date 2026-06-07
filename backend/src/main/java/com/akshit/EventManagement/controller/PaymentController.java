package com.akshit.EventManagement.controller;

import com.akshit.EventManagement.domain.dto.payment.CreateOrderRequestDto;
import com.akshit.EventManagement.domain.dto.payment.CreateOrderResponseDto;
import com.akshit.EventManagement.domain.dto.payment.VerifyPaymentRequestDto;
import com.akshit.EventManagement.services.PaymentService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.akshit.EventManagement.utils.JwtUtil.getUserId;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;


    @PostMapping("/orders")
    public ResponseEntity<CreateOrderResponseDto> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequestDto request
    ) throws RazorpayException {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(
                paymentService.createOrder(userId, request.ticketTypeId(), request.quantity()));
    }

    //Verify Razorpay HMAC signature and issue the purchased tickets>>>>>>

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequestDto request
    ) {
        paymentService.verifyAndIssueTickets(getUserId(authentication), request);
        return ResponseEntity.noContent().build();
    }
}
