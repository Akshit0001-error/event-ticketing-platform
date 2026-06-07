package com.akshit.EventManagement.domain.enums;

public enum QrCodeStatusEnum {
    ACTIVE,
    EXPIRED,
    REVOKED   // Set when the owning ticket is cancelled — blocks gate entry
}
