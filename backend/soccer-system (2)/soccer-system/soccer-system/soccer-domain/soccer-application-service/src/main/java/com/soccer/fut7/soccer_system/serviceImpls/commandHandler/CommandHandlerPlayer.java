package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperPlayer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import javax.smartcardio.Card;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperPlayer;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class CommandHandlerPlayer {

    private final CommandHelperPlayer commandHelperPlayer;

    public Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(UUID categoryId) {
        return commandHelperPlayer.getPlayersOrganizedByPoints(categoryId);
    }

    public Player registerBasicPlayer(PlayerCreateRecord playerCreate) {
        return commandHelperPlayer.registerBasicPlayer(playerCreate);
    }

    public PlayerDetailsRecord getPlayerFullDetails(UUID playerId) {
        return commandHelperPlayer.getPlayerFullDetails(playerId);
    }

    public Player updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord,CardsRecord card) {
        return commandHelperPlayer.updatePlayerPositionStats(playerId, goalsRecord, pointsRecord,card);
    }


    
    public Boolean updatePhotoIdUser(UUID playerId, String photoId) {
        return commandHelperPlayer.updatePhotoIdUser(playerId, photoId);
    }

    public void deleteAllPlayersFromTeam(UUID teamId) {
        commandHelperPlayer.deleteAllPlayersFromTeam(teamId);
    }

    public void removePlayerFromTeam(UUID playerId) {
        commandHelperPlayer.removePlayerFromTeam(playerId);
    }

    public Boolean updateBasicInformation(Set<PlayerCreateRecord> playerCreate) {
        return commandHelperPlayer.updateBasicInformation(playerCreate);
    }


     
    public Boolean updateBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate) {
            return commandHelperPlayer.updateBasicInformationBatchDetails(playerCreate);
    }


    public Boolean createBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate, UUID teamId) {
        return commandHelperPlayer.createBasicInformationBatchDetails(playerCreate,teamId);
    }

    public void removePlayersFromTeam(UUID playerId, List<UUID> playerIds) {
        commandHelperPlayer.removePlayersFromTeam(playerId, playerIds);
    }


    public Set<PlayerSummaryRecord> getPlayersByName(String playerName) {
        return commandHelperPlayer.getPlayersByName(playerName);
    }
   
}