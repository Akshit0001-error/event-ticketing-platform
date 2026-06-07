package com.akshit.EventManagement.services;

import com.akshit.EventManagement.domain.dto.payment.CreateOrderResponseDto;
import com.akshit.EventManagement.domain.dto.payment.VerifyPaymentRequestDto;
import com.akshit.EventManagement.domain.entity.PaymentRecord;
import com.akshit.EventManagement.domain.entity.TicketType;
import com.akshit.EventManagement.exceptions.InsufficientTicketsException;
import com.akshit.EventManagement.exceptions.PaymentVerificationException;
import com.akshit.EventManagement.exceptions.TicketTypeNotFoundException;
import com.akshit.EventManagement.repositories.PaymentRecordRepository;
import com.akshit.EventManagement.repositories.TicketRepository;
import com.akshit.EventManagement.repositories.TicketTypeRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient          razorpayClient;   // singleton bean — injected, not newed
    private final TicketTypeRepository    ticketTypeRepository;
    private final TicketRepository        ticketRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final TicketTypeService       ticketTypeService;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public CreateOrderResponseDto createOrder(UUID userId, UUID ticketTypeId, int quantity)
            throws RazorpayException {

        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new TicketTypeNotFoundException("Ticket type not found"));

        // Real availability check: total capacity minus already-sold tickets
        int sold      = ticketRepository.countActiveByTicketTypeId(ticketTypeId);
        int remaining = ticketType.getTotalAvailable() != null
                ? ticketType.getTotalAvailable() - sold : Integer.MAX_VALUE;

        if (remaining < quantity) {
            throw new InsufficientTicketsException(
                    "Only %d ticket(s) available, requested %d".formatted(remaining, quantity));
        }

        long totalAmountInPaise = Math.round(ticketType.getPrice() * quantity * 100);
//        long totalAmountInPaise = ticketType.getPrice()
//                .multiply(BigDecimal.valueOf(quantity))
//                .multiply(BigDecimal.valueOf(100))
//                .longValue();

        String receiptId = "rcpt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        JSONObject orderRequest = new JSONObject()
                .put("amount", totalAmountInPaise)
                .put("currency", "INR")
                .put("receipt", receiptId)
                .put("notes", new JSONObject()
                        .put("ticketTypeId", ticketTypeId.toString())
                        .put("userId", userId.toString())
                        .put("quantity", quantity));

        Order order = razorpayClient.orders.create(orderRequest);
        log.info("Razorpay order created: {} | ticketType: {} | qty: {}",
                order.get("id"), ticketTypeId, quantity);

        return new CreateOrderResponseDto(
                order.get("id"),
                totalAmountInPaise,
                "INR",
                keyId,
                ticketType.getName(),
                ticketType.getPrice(),
                quantity
        );
    }


     // Verifies the Razorpay HMAC signature
    @Transactional
    public void verifyAndIssueTickets(UUID userId, VerifyPaymentRequestDto request) {

        // 1 — HMAC signature verification
        String expected = generateSignature(
                request.razorpayOrderId() + "|" + request.razorpayPaymentId());
        if (!expected.equals(request.razorpaySignature())) {
            log.warn("Payment signature mismatch for user: {}", userId);
            throw new PaymentVerificationException("Payment verification failed: invalid signature");
        }

        // 2 — Replay-attack guard: reject if this paymentId was already processed
        if (paymentRecordRepository.existsById(request.razorpayPaymentId())) {
            log.warn("Replay attempt detected — paymentId {} already processed", request.razorpayPaymentId());
            throw new PaymentVerificationException("Payment already processed");
        }

        // 3 — Persist the payment record BEFORE issuing tickets
        PaymentRecord record = PaymentRecord.builder()
                .razorpayPaymentId(request.razorpayPaymentId())
                .razorpayOrderId(request.razorpayOrderId())
                .userId(userId)
                .ticketTypeId(request.ticketTypeId())
                .quantity(request.quantity())
                .build();
        paymentRecordRepository.save(record);

        log.info("Payment verified: paymentId={} qty={}", request.razorpayPaymentId(), request.quantity());

        // 4 — Issue N tickets atomically (all succeed or all roll back)
        for (int i = 0; i < request.quantity(); i++) {
            ticketTypeService.purchaseTicket(userId, request.eventId(), request.ticketTypeId());
        }
    }

    private String generateSignature(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Failed to generate HMAC signature for payment verification", e);
            throw new PaymentVerificationException(
                    "Payment verification failed: could not compute signature");
        }
    }
}
