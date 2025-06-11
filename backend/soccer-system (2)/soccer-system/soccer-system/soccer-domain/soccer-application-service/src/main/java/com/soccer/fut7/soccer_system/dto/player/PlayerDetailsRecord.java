package com.soccer.fut7.soccer_system.dto.player;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.ContactInfoRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public record PlayerDetailsRecord(
    String playerId,
    String firstName,
    String lastName,
    LocalDate birthDate,
    int jerseyNumber,
    int age,
    String photoUrl,
    String playerStatus,
    boolean captain,
    String email,
    int goals,
    int points,
    int yellowCards,
    int redCards,
    String teamId,
    String teamName
) {}

