package com.soccer.fut7.soccer_system.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerTeam;

@Service
@Lazy

@AllArgsConstructor
public class TeamApplicationServiceImp implements TeamApplicationService {


    @Autowired
    private final CommandHandlerTeam commandHandlerTeam;

    

    public List<TeamScore> getTeamsByPosition(UUID categoryId) {
        return commandHandlerTeam.getTeamsByPosition(categoryId);
    }
    @Override
    public TeamWithPlayersRecord  getTeamsNameIdByCategoryWithPlayers(UUID categoryId, UUID teamId) {
        return commandHandlerTeam.getTeamsNameIdByCategoryWithPlayers(categoryId, teamId);
    }

    @Override
    public TeamDetailsRecord createNewTeam(TeamCreateRecord newTeam) {
        return commandHandlerTeam.createNewTeam(newTeam);
    }

    @Override
    public void deleteTeamByCategory(UUID categoryId, UUID teamId) {
        commandHandlerTeam.deleteTeamByCategory(categoryId, teamId);
    }

    @Override
    public TeamDetailsRecord updateTeamByCategory(UUID categoryId, UUID teamId, TeamDetailsRecord updatedTeam) {
        return commandHandlerTeam.updateTeamByCategory(categoryId, teamId, updatedTeam);
    }

    @Override
    public void deleteAllTeamByCategory(UUID categoryId) {
       commandHandlerTeam.deleteAllTeamByCategory(categoryId);
    }

    
    @Override
    public TeamDetailsRecord getTeamWithoutPlayers(UUID teamId, UUID categoryId) {
        return commandHandlerTeam.getTeamsNameIdByCategoryWithoutPlayers(categoryId, teamId);
    }

    @Override
    public TeamDetailsRecord updateTeamByCategoryWithLogoOrName(UUID categoryId, UUID teamId, String logo,
            String name) {
       return commandHandlerTeam.updatTeamLogoOrName(categoryId, teamId, logo, name);
    }

    @Override
    public Boolean existTeam(UUID newTeam) {
        return commandHandlerTeam.existTeam(newTeam);
    }
    @Override
    public Set<TeamScore> getAllTeamFromCategory(UUID categoryId) {
        return commandHandlerTeam.getAllTeamFromCategory(categoryId);

    }
    @Override
    public List<TeamNameIdRecord> getTeamsByName(String teamName) {
        return commandHandlerTeam.getTeamsByName(teamName); 
    }
    
}