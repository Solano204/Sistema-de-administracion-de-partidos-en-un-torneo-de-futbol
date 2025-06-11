package com.soccer.fut7.soccer_system.dto.team;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public record TeamSummaryRecord(
    UUID id,
    String name,
    GoalsRecord goalsWin,
    GoalsRecord goalsAgainst,
    PointsRecord points,
    int numberOfPlayers
) {}