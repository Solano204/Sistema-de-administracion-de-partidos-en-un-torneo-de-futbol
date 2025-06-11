package com.soccer.fut7.soccer_system.dto.player;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public record PlayerOrganizedRecord(
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