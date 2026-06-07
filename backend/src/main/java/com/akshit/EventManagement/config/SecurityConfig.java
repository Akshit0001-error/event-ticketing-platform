package com.akshit.EventManagement.config;

import com.akshit.EventManagement.auth.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter)
            throws Exception {
        http
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints — always public
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()                        // Public event catalogue — no login needed to browse
                        .requestMatchers(HttpMethod.GET, "/api/v1/published-events/**").permitAll()
                        // Ticket purchase is for ATTENDEE (endpoint lives under /api/v1/events/**)
                        .requestMatchers(HttpMethod.POST, "/api/v1/events/*/ticket-types/*/tickets").hasRole("ATTENDEE")
                        // Only organizers can create/manage events
                        .requestMatchers("/api/v1/events/**").hasRole("ORGANIZER")
                        // Ticket viewing/QR download is for ATTENDEE only
                        .requestMatchers("/api/v1/tickets/**").hasRole("ATTENDEE")
                        .requestMatchers("/api/v1/payments/**").hasRole("ATTENDEE") //payment
                        // Only staff can validate tickets
                        .requestMatchers("/api/v1/ticket-validations/**").hasRole("STAFF")
                        // Everything else (buy ticket, view my tickets, QR codes) requires login
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Run our JWT filter before Spring's default username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    //BCryptPassword encoder....
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
