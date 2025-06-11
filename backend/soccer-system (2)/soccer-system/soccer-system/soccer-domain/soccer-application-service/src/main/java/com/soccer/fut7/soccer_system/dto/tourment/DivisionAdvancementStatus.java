package com.soccer.fut7.soccer_system.dto.tourment;

public record DivisionAdvancementStatus(
        boolean canAdvance,
        String currentPhase,
        String nextPhase,
        int completedMatches,
        int totalMatches,
        int teamsReady,
        int totalTeams,
        String divisionName) {
}