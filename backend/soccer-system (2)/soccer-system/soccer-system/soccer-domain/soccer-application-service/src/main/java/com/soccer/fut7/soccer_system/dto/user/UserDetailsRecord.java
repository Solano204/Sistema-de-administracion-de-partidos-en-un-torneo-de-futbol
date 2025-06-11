package com.soccer.fut7.soccer_system.dto.user;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

public record UserDetailsRecord(
    UUID id,
    String firstName,
    String lastName,
    LocalDate birthDate,
    Integer age,
    String user,
    UserRole role,
    UserStatus status
) {}