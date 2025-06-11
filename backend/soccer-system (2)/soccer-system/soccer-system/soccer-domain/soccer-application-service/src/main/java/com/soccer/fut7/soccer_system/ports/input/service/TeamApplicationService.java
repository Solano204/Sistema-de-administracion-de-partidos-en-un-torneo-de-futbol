package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.dto.team.TeamSummaryRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;

public interface TeamApplicationService {

    TeamDetailsRecord createNewTeam(TeamCreateRecord newTeam);
    Boolean existTeam(UUID newTeam);
 
    
    TeamDetailsRecord getTeamWithoutPlayers(UUID teamId, UUID categoryId);

    TeamWithPlayersRecord getTeamsNameIdByCategoryWithPlayers(UUID categoryId, UUID teamId);

    void deleteTeamByCategory(UUID categoryId, UUID teamId);
    void deleteAllTeamByCategory(UUID categoryId);
    TeamDetailsRecord updateTeamByCategory(UUID categoryId, UUID teamId, TeamDetailsRecord updatedTeam);
   
    public List<TeamScore> getTeamsByPosition(UUID categoryId);
    public Set<TeamScore> getAllTeamFromCategory(UUID categoryId);
    public TeamDetailsRecord updateTeamByCategoryWithLogoOrName(UUID categoryId, UUID teamId, String logo, String name); 

    public List<TeamNameIdRecord> getTeamsByName(String teamName);
        

}
