package com.soccer.fut7.soccer_system.dto.user;

import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

public record UserLoginResponseRecord(
    UUID userId,
    String user,
    UserRole role,
    UserStatus status,
    String token,
    String refreshToken
) {}