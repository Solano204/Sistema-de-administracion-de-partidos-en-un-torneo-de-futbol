package com.soccer.fut7.soccer_system.dto.player;

import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.ContactInfoRecord;

public record PlayerUpdateRecord(
    UUID id,
    Optional<String> jerseyNumber,
    Optional<ContactInfoRecord> contactInfo
) {}