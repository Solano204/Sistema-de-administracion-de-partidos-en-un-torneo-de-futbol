package com.soccer.fut7.soccer_system.team.dto.projection;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.Data;

// MatchFullDataDTO.java
@Data
public class MatchFullDataDTO {
    private UUID id;
    private LocalDate matchDate;
    private UUID tournamentId;
    
    // Referee info
    private UUID refereeId;
    private String refereeFirstName;
    private String refereeLastName;
    
    // Home team info
    private UUID homeTeamId;
    private String homeTeamName;
    private String homeTeamLogoUrl;
    private Integer homeTeamGoals;
    private Integer homeTeamGoalsAgainst;
    private Integer homeTeamPoints;
    
    // Away team info
    private UUID awayTeamId;
    private String awayTeamName;
    private String awayTeamLogoUrl;
    private Integer awayTeamGoals;
    private Integer awayTeamGoalsAgainst;
    private Integer awayTeamPoints;
    
    // Journey info
    private UUID journeyId;
    private Integer journeyNumber;
    private LocalDate journeyStartDate;
    private LocalDate journeyEndDate;
    
    // Winner info
    private UUID winnerTeamId;
    private String winnerTeamName;
    
    private String phase;
    private String matchStatus;
    
    // Players with stats
    private List<PlayerWithStatsDTO> homeTeamPlayers;
    private List<PlayerWithStatsDTO> awayTeamPlayers;
}