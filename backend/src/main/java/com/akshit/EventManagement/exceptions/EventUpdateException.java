package com.akshit.EventManagement.exceptions;


public class EventUpdateException extends RuntimeException{
    public EventUpdateException() {
    }

    public EventUpdateException(String message) {
        super(message);
    }

    public EventUpdateException(String message, Throwable cause) {
        super(message, cause);
    }

    public EventUpdateException(Throwable cause) {
        super(cause);
    }

    public EventUpdateException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
