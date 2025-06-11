package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.ExceptionApplication.PlayerException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerUpdateDetails;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.PlayerRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;

import lombok.*;

@Component
@Lazy

@RequiredArgsConstructor
public class CommandHelperPlayer {
    private final EntityDtoMapperDomain mapper;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    @Transactional
    public Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(UUID categoryId) {
        // Validate category exists if needed
        return playerRepository.getPlayersOrganizedByPoints(categoryId).stream()
                .map(player -> mapper.playerToPlayerOrganizedRecord(player))
                .collect(Collectors.toSet());
    }

    @Transactional
    public Player registerBasicPlayer(PlayerCreateRecord playerCreate) {
        // Map PlayerCreateRecord to Player
        Player newPlayer = mapper.playerCreateRecordToPlayer(playerCreate);
        
        // Initialize defaults for missing fields
        mapper.initializePlayerDefaults(newPlayer);
    
        // Save and return player
        return playerRepository.registerPlayerWithBasicInfo(newPlayer)
                .orElseThrow(() -> new PlayerException("Failed to register player"));
    }
    

    @Transactional
    public PlayerDetailsRecord getPlayerFullDetails(UUID playerId) {
        return playerRepository.getPlayerFullDetails(playerId)
                .map(details -> mapper.toRecord(details))
                .orElseThrow(() -> new PlayerException("Player not found"));
    }

    @Transactional
    public Player updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord, CardsRecord card) {
        return playerRepository.updatePlayerPositionStats(playerId, goalsRecord, pointsRecord, card)
                .orElseThrow(() -> new PlayerException("Failed to update player stats"));
    }
    public Boolean updatePhotoIdUser(UUID playerId, String photoId) {
        return playerRepository.updatePhotoIdUser(playerId, photoId)
                .orElseThrow(() -> new PlayerException("Failed to update player stats"));

    }

    @Transactional
    public void deleteAllPlayersFromTeam(UUID teamId) {
        // Validate team exists
        teamRepository.existTeam(teamId)
                .orElseThrow(() -> new PlayerException("Team not found"));

        playerRepository.deleteAllPlayersFromTeam(teamId);
    }

    @Transactional
    public void removePlayerFromTeam(UUID playerId) {
        // Validate player exists
        playerRepository.getPlayerFullDetails(playerId)
                .orElseThrow(() -> new PlayerException("Player not found"));

        playerRepository.removePlayerFromTeam(playerId);
    }



    @Transactional
    public Boolean updateBasicInformation(Set<PlayerCreateRecord> playerCreate) {
       Set <Player> players = mapper.mapPlayers(playerCreate);
        return playerRepository.registerBatchPlayerWithBasicInfo(players)
                .orElseThrow(() -> new PlayerException("Failed to register player"));
    }

    @Transactional
    public Boolean updateBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate) {
       Set <Player> players = mapper.mapPlayers(playerCreate);

        return playerRepository.updateBatchPlayerInformation(players)
                .orElseThrow(() -> new PlayerException("Failed to register player"));
    }



    public Boolean  createBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate, UUID teamId) {
        teamRepository.existTeam(teamId).orElseThrow(() -> new teamException("Team not found"));
        Set <Player> players = mapper.mapPlayers(playerCreate);
        return playerRepository.registerBatchPlayerWithBasicInfo(players)
                .orElseThrow(() -> new PlayerException("Failed to register player"));
    }

    public void removePlayersFromTeam(UUID teamId,List<UUID> playerIds) {
        teamRepository.existTeam(teamId).orElseThrow(() -> new teamException("Team not found"));
        playerRepository.removePlayersFromTeam(teamId,playerIds);
   
    }


    public Set<PlayerSummaryRecord> getPlayersByName(String playerName) {
        return playerRepository.getPlayersByName(playerName).stream()
                .map(player -> mapper.playerToPlayerSummaryRecord(player))
                .collect(Collectors.toSet());
    }
}