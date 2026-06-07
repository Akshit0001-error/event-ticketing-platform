package com.akshit.EventManagement.domain.enums;

/**
 * Defines the three roles in the platform.
 *
 * ATTENDEE  – self-registers; browses events and purchases tickets.
 * ORGANIZER – self-registers; creates and manages events.
 * STAFF     – assigned by an admin; validates tickets at event doors.
 *
 * STAFF cannot self-register to prevent privilege escalation.
 */
public enum UserRole {
    ATTENDEE,
    ORGANIZER,
    STAFF
}
