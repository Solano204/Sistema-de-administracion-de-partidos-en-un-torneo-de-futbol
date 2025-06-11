package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerUpdateDetails;
import com.soccer.fut7.soccer_system.dto.player.PlayerUpdateRecord;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;


import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public interface PlayerApplicationService {
    
    Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(UUID categoryId);
    
    Player registerBasicPlayer(PlayerCreateRecord playerCreate);
    
    PlayerDetailsRecord getPlayerFullDetails(UUID playerId);
    
    Player updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord,CardsRecord card);
    
    Boolean updatePhotoIdUser(UUID playerId, String photoId);
    
    void deleteAllPlayersFromTeam(UUID teamId);
    
    void removePlayerFromTeam(UUID playerId);
    
    Boolean updateBasicInformation(Set<PlayerCreateRecord> playerCreate);
    Boolean updateBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate);
    Boolean createBasicInformationBatchDetails(Set<PlayerCreateRecord> playerCreate,UUID teamId);
    void removePlayersFromTeam(UUID playerId,List <UUID> playerIds);

    Set<PlayerSummaryRecord> getPlayersByName(String playerName);
}