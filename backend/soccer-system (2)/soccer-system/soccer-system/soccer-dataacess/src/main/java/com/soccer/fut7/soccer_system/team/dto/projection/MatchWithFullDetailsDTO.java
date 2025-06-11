package com.soccer.fut7.soccer_system.team.dto.projection;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;

// MatchWithFullDetailsDTO.java

import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchWithFullDetailsDTO {
    private UUID id;
    private LocalDate matchDate;
    
    // Tournament field
    private UUID tournamentId;
    
    // Referee fields
    private UUID refereeId;
    private String refereeFirstName;
    private String refereeLastName;
    
    // Home team fields
    private UUID homeTeamId;
    private String homeTeamName;
    private String homeTeamLogoUrl;
    
    // Away team fields
    private UUID awayTeamId;
    private String awayTeamName;
    private String awayTeamLogoUrl;
    
    // Journey fields
    private UUID journeyId;
    private Integer journeyNumber;
    private LocalDate journeyStartDate;
    private LocalDate journeyEndDate;
    
    // Winner team fields
    private UUID winnerTeamId;
    private String winnerTeamName;
    private String winnerTeamLogoUrl;
    
    private String phase;
    private String matchStatus;
}