package com.soccer.fut7.soccer_system.dto.tourment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

    public record WeeklyScheduleRecordRequest(
                    UUID id,
                    UUID matchId,
                    UUID tournamentId,
                    // UUID journeyId,
                    String matchDay,
                    LocalDate matchDate,
                    LocalTime matchTime,
                    String homeTeamName,
                    String awayTeamName,
                    String tournamentName,
                    String categoryName,
                    String phase,
                    String status)
                    // String divisionName
                     {
    }