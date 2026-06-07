package com.akshit.EventManagement.auth;

import com.akshit.EventManagement.domain.enums.UserRole;

public record LoginResponse(
        String token,
        String name,
        UserRole role
) {}
