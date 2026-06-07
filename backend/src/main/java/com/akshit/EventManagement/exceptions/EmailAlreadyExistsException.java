package com.akshit.EventManagement.exceptions;

/**
 * Thrown during registration when the provided email address
 * is already associated with an existing account.
 */
public class EmailAlreadyExistsException extends EventTicketException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
