package com.soccer.fut7.soccer_system.dto.tourment;

public record TournamentStageInfo(
        String currentStage,
        boolean canCreateDivisions,
        int recommendedDivisions,
        int totalTeams,
        int completedMatches,
        int totalMatches) {
}