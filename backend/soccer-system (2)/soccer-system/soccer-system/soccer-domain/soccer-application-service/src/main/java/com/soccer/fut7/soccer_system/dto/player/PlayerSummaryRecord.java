package com.soccer.fut7.soccer_system.dto.player;

import java.util.UUID;

public record PlayerSummaryRecord(
    UUID id,
    String fullName,
    String jerseyNumber
) {}