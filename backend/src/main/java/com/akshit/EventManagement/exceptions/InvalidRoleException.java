package com.akshit.EventManagement.exceptions;

/**
 * Thrown when a user attempts to register with a role that is not
 * permitted for self-registration (currently: STAFF).
 */
public class InvalidRoleException extends EventTicketException {
    public InvalidRoleException(String message) {
        super(message);
    }
}
