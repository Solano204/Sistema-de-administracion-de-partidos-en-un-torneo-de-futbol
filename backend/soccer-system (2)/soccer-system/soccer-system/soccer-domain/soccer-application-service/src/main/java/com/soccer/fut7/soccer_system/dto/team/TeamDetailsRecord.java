package com.soccer.fut7.soccer_system.dto.team;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.dto.utility.ContactInfoRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public record TeamDetailsRecord(
    UUID id,
    String name,
    CategoryInfoRecord category,
    String logo,
    int numberOfPlayers,
    GoalsRecord goalsWin,
    GoalsRecord goalsAgainst,
    PointsRecord points,
    int matchesPlayed,
    int matchesWon,
    int matchesDrawn,
    int matchesLost,
    boolean qualified
) {}    