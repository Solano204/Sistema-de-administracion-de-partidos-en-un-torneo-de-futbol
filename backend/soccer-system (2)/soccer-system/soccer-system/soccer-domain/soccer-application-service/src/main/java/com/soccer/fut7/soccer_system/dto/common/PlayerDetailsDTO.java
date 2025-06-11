package com.soccer.fut7.soccer_system.dto.common;

import java.time.LocalDate;

public record PlayerDetailsDTO(
    String playerId,
    String firstName,
    String lastName,
    int jerseyNumber,
    String photoUrl,
    LocalDate birthDate,
    String playerStatus,
    boolean captain,
    String email,
    int age,
    int goals,
    int points,
    int statsJerseyNumber,
    int yellowCards,
    int redCards,
    String teamId,
    String teamName
) {}
