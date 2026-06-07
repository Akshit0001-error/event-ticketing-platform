package com.akshit.EventManagement.auth;

import com.akshit.EventManagement.domain.entity.User;
import com.akshit.EventManagement.domain.enums.UserRole;
import com.akshit.EventManagement.exceptions.InvalidCredentialsException;
import com.akshit.EventManagement.exceptions.EmailAlreadyExistsException;
import com.akshit.EventManagement.exceptions.InvalidRoleException;
import com.akshit.EventManagement.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void register(RegisterRequest request) {

        // Block self-registration as STAFF — this is a privileged role
        if (UserRole.STAFF.equals(request.role())) {
            throw new InvalidRoleException(
                    "Staff accounts cannot be self-registered. Please contact an administrator.");
        }

        // Normalise email
        String normalisedEmail = request.email().toLowerCase().trim();

        if (userRepository.existsByEmail(normalisedEmail)) {
            throw new EmailAlreadyExistsException(
                    "An account with this email address already exists.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalisedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password())); // BCrypt hash
        user.setRole(request.role());

        userRepository.save(user);
        log.info("New {} registered: {}", request.role(), normalisedEmail);
    }


    public LoginResponse login(LoginRequest request) {

        String normalisedEmail = request.email().toLowerCase().trim();

        User user = userRepository.findByEmail(normalisedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Failed login attempt for email: {}", normalisedEmail);
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        log.info("Successful login: {} ({})", normalisedEmail, user.getRole());

        return new LoginResponse(token, user.getName(), user.getRole());
    }
}
