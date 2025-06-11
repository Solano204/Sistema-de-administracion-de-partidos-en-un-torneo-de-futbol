package com.soccer.fut7.soccer_system.dto.common;

import java.util.UUID;

public record PlayerStatsDTO(
    UUID playerId,
    String firstName,
    String photoUrl,
    int jerseyNumber,
    int goals,
    int points ,
    int redCards,
    int yellowCards,
    UUID teamId,
    String teamLogoUrl,
    String teamName,
    UUID categoryId,
    String categoryName
) {}