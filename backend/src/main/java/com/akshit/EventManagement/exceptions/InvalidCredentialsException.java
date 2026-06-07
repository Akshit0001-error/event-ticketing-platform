package com.akshit.EventManagement.exceptions;

/**
 * Thrown when login credentials (email/password) do not match.
 * The message is intentionally vague to avoid leaking whether an email exists.
 */
public class InvalidCredentialsException extends EventTicketException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
