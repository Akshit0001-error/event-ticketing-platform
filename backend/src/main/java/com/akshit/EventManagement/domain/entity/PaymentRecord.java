package com.akshit.EventManagement.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persists every verified Razorpay payment ID to prevent replay attacks.
 *
 * Before issuing tickets, PaymentService checks whether the razorpayPaymentId
 * already exists here. If it does, the request is rejected. This prevents
 * an attacker from replaying a valid (orderId, paymentId, signature) triplet
 * to get unlimited free tickets.
 *
 * The record is saved in the SAME transaction that creates the tickets — both
 * commit or both roll back together.
 */
@Entity
@Table(name = "payment_records")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @Column(name = "razorpay_payment_id", nullable = false, updatable = false)
    private String razorpayPaymentId;

    @Column(name = "razorpay_order_id", nullable = false, updatable = false)
    private String razorpayOrderId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "ticket_type_id", nullable = false, updatable = false)
    private UUID ticketTypeId;

    @Column(name = "quantity", nullable = false, updatable = false)
    private int quantity;

    @CreatedDate
    @Column(name = "verified_at", nullable = false, updatable = false)
    private LocalDateTime verifiedAt;
}
