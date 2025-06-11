package com.soccer.fut7.soccer_system.dto.tourment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DivisionAdvancementStatusRecord {
    private boolean canAdvance;
    private String currentPhase;
    private String nextPhase;
    private int completedMatches;
    private int totalMatches;
    private int teamsReady;
    private int totalTeams;
    private String divisionName;
}