package com.soccer.fut7.soccer_system.team.dto.projection;

import java.time.LocalDate;
import java.util.UUID;
public interface PlayerWithTeamAndStatsProjection {
    // Player fields
    UUID getPlayerId();
    String getPlayerFirstName();
    String getPlayerLastName();
    Integer getPlayerAge();
    LocalDate getPlayerBirthDate();
    String getPlayerPhotoUrl();
    String getPlayerEmail();
    Integer getPlayerJerseyNumber();
    Boolean getPlayerCaptain();
    String getPlayerStatus();
    
    // Team fields
    UUID getTeamId();
    String getTeamName();
    String getTeamLogoUrl();
    UUID getTeamCategoryId();
    UUID getTeamTournamentId();
    Integer getTeamNumberOfPlayers();
    Boolean getTeamActive();
    
    // Category fields
    UUID getCategoryId();
    String getCategoryName();
    Integer getCategoryMinAge();
    Integer getCategoryMaxAge();
    
    // Player Stats fields
    UUID getPlayerStatsId();
    Integer getPlayerStatsGoals();
    Integer getPlayerStatsPoints();
    Integer getPlayerStatsYellowCards();
    Integer getPlayerStatsRedCards();
}