package com.soccer.fut7.soccer_system.dto.user;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;

public record UserUpdateBasicInformation(
    UUID id,
    String firstName,
    String lastName,
    String email,
    LocalDate birthDate,
    Integer age,
    String role
    
) {}