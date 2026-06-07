package com.akshit.EventManagement.utils;

import org.springframework.security.core.Authentication;

import java.util.UUID;

/**
 * Utility for extracting the authenticated user's ID from the SecurityContext.
 *
 * After JwtAuthFilter runs, the Authentication principal is set to the user's
 * UUID directly (cast-safe UUID). Controllers use this helper instead of
 * depending on the Keycloak Jwt type.
 *
 * Usage in controllers:
 *   UUID userId = JwtUtil.getUserId(authentication);
 */
public final class JwtUtil {

    private JwtUtil() {}

    /**
     * Extracts the authenticated user's UUID from the Spring Security Authentication object.
     * The principal is populated as a UUID by JwtAuthFilter on every authenticated request.
     */
    public static UUID getUserId(Authentication authentication) {

        return (UUID) authentication.getPrincipal();
    }
}

