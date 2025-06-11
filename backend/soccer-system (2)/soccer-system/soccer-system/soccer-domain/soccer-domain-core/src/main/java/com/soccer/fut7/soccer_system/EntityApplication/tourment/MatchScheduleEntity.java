package com.soccer.fut7.soccer_system.EntityApplication.tourment;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
@Data

public class MatchScheduleEntity {
    private UUID id;
    private UUID matchId;
    private UUID tournamentId;
    // private UUID journeyId;
    private String matchDay;
    private LocalDate matchDate;
    private LocalTime matchTime;
    // private UUID homeTeamId;
    // private UUID awayTeamId;
    private String homeTeamName;
    private String awayTeamName;
    private String tournamentName;
    // private UUID categoryId;
    private String categoryName;
    private String phase;
    private String status;
    // private String divisionName;
}