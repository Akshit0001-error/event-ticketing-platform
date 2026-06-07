package com.akshit.EventManagement.exceptions;

/**
 * Thrown when a ticket cancellation is attempted but cannot proceed.
 * Covers three cases — each with a distinct message:
 *   1. Ticket is already cancelled
 *   2. Event has already started (or passed)
 *   3. Cancellation window has closed (e.g. within 24 h of event start)
 */
public class TicketCancellationException extends RuntimeException {
    public TicketCancellationException(String message) {
        super(message);
    }
}
