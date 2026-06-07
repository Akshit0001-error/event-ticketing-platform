package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {


     // Used during login to look up a user by their email address.

    Optional<User> findByEmail(String email);

     // Used during registration to check for duplicate email addresses

    boolean existsByEmail(String email);
}
