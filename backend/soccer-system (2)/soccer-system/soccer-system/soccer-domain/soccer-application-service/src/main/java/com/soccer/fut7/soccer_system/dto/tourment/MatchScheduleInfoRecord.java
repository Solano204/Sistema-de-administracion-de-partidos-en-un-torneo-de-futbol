package com.soccer.fut7.soccer_system.dto.tourment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MatchScheduleInfoRecord(
    UUID id,
    UUID matchId,
    UUID tournamentId,
    // UUID journeyId,
    String matchDay,
    LocalDate matchDate,
    LocalTime matchTime,
    // UUID homeTeamId,
    // UUID awayTeamId,
    String homeTeamName,
    String awayTeamName,
    String tournamentName,
    // UUID categoryId,
    String categoryName,
    String phase,
    String status
    // String divisionName
) {}