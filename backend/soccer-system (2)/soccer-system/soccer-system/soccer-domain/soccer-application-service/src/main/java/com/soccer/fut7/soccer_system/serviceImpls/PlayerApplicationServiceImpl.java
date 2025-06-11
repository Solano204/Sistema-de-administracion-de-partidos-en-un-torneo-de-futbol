package com.soccer.fut7.soccer_system.serviceImpls;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerUpdateDetails;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerPlayer;

import lombok.*;


import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerPlayer;

import lombok.RequiredArgsConstructor;

@Service
@Lazy
@RequiredArgsConstructor
public class PlayerApplicationServiceImpl implements PlayerApplicationService {

    private final CommandHandlerPlayer commandHandlerPlayer;

    @Override
    public Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(UUID categoryId) {
        return commandHandlerPlayer.getPlayersOrganizedByPoints(categoryId);
    }

    @Override
    public Player registerBasicPlayer(PlayerCreateRecord playerCreate) {
        return commandHandlerPlayer.registerBasicPlayer(playerCreate);
    }

    @Override
    public PlayerDetailsRecord getPlayerFullDetails(UUID playerId) {
        return commandHandlerPlayer.getPlayerFullDetails(playerId);
    }

    @Override
    public Player updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord,CardsRecord card) {
        return commandHandlerPlayer.updatePlayerPositionStats(playerId, goalsRecord, pointsRecord,card);
    }

 

    @Override
    public Boolean updatePhotoIdUser(UUID playerId, String photoId) {
        return commandHandlerPlayer.updatePhotoIdUser(playerId, photoId);
    }

    @Override
    public void deleteAllPlayersFromTeam(UUID teamId) {
        commandHandlerPlayer.deleteAllPlayersFromTeam(teamId);
    }

    @Override
    public void removePlayerFromTeam(UUID playerId) {
        commandHandlerPlayer.removePlayerFromTeam(playerId);
    }

    @Override
    public Boolean updateBasicInformation(Set<PlayerCreateRecord> playerCreate) {
        return commandHandlerPlayer.updateBasicInformation(playerCreate);
    }

    @Override
    public Boolean updateBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate) {
        return commandHandlerPlayer.updateBasicInformationBatchDetails(playerCreate);
    }

    

    @Override
    public Boolean createBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate, UUID teamId) {
        return commandHandlerPlayer.createBasicInformationBatchDetails(playerCreate,teamId);
    }

    @Override
    public void removePlayersFromTeam(UUID playerId, List<UUID> playerIds) {
        // TODO Auto-generated method stub
        commandHandlerPlayer.removePlayersFromTeam(playerId,playerIds);
    }

    @Override
    public Set<PlayerSummaryRecord> getPlayersByName(String playerName) {
        // TODO Auto-generated method stub
        return commandHandlerPlayer.getPlayersByName(playerName);
    }
}