package com.soccer.fut7.soccer_system.dto.referee;

import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;


public record RefereeDetailsRecord(
    UUID id,
    String name,
    String lastName,
    UserRole role) {}