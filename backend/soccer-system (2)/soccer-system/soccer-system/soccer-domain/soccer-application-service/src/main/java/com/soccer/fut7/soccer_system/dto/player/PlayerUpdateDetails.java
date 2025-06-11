package com.soccer.fut7.soccer_system.dto.player;

public record PlayerUpdateDetails (
    String playerId,
    String firstName,
    String lastName,
    int jerseyNumber,
    String photoUrl,
    String birthDate,
    boolean captain,
    String email
) {}