package com.soccer.fut7.soccer_system.ports.outport;

import java.lang.foreign.Linker.Option;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamSummaryRecord;

@Component
public interface TeamRepository {

    public Optional<Boolean> existTeam(UUID team);

    public void deleteTeam(UUID team);

    public void updateTeamDetails(Team team);// New method to get teams by position (sorted by points)

    Optional<Set<TeamStats>> getTeamsByPosition(UUID categoryId);
    Optional<Set<TeamStats>> getAllTeamFromCategory(UUID categoryId);

    // New method to get team by name and category
    Optional<Team> getTeamNameIdByNameAndCategory(String teamName, UUID categoryId);

    public Optional<Team> createTeam(Team team);

    public Optional<Team> getTeam(UUID team);
    public Optional<Team> getTeamWithoutPlayers(UUID team);

    // Existing methods with additional implementations
    void deleteTeamByCategory(UUID categoryId, UUID teamId);
    void deleteAllTeamsByCategory(UUID categoryId);
    Optional<Team> updateTeamByCategory(UUID categoryId, UUID teamId, Team updatedTeam);
    Optional<Team> updateTeamNameOrLogo(UUID teamId, String name, String logo);// New method to get teams by position (sorted by points)

    List<Team> getTeamsByName(String teamName);
}
