package com.akshit.EventManagement.notifications;

/**
 * Common contract for all notification channels (email, push, etc.).
 * Each implementation sends a ticket-purchase confirmation independently.
 * The dispatcher calls all registered implementations after a successful purchase.
 */
public interface NotificationService {

    /**
     * Send a ticket-purchase confirmation via this channel.
     * Implementations must NOT throw — log failures and return gracefully
     * so one broken channel never rolls back the ticket transaction.
     */
    void sendTicketConfirmation(TicketConfirmationData data);
}
