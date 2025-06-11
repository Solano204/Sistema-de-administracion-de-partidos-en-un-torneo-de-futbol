package com.soccer.fut7.soccer_system.dto.match;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

import java.util.Set;
import java.util.UUID;

public record MatchStatsDetails(
    String name,
    UUID id,
    GoalsRecord goalsWin,
    GoalsRecord goalsAgainst,
    PointsRecord points,
    Set<PlayerMatchStatsRecordDto> infoPlayerMatchStats
) {
}
