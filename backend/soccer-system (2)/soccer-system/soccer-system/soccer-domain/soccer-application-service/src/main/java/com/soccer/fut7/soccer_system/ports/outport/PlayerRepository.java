package com.soccer.fut7.soccer_system.ports.outport;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.dto.common.PlayerDetailsDTO;
import com.soccer.fut7.soccer_system.dto.common.PlayerStatsDTO;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;


@Service
public interface PlayerRepository {
  // Organize players with most points
    Set<PlayerStatsDTO> getPlayersOrganizedByPoints(UUID categoryId);
    
    // Register a new player with minimal information
    Optional<Player> registerPlayerWithBasicInfo(Player player);
    Optional<Boolean> updateBatchPlayerInformation(Set<Player> player);
    Optional<Player> updatePlayerBasicInfo(Player player);
    
    Optional<Boolean> updatePhotoIdUser(UUID playerId, String photoId);

    // Get player with full details
    Optional<PlayerDetailsDTO> getPlayerFullDetails(UUID playerId);
    
    // Update player positions stats
    Optional<Player> updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord,CardsRecord card);
    
    // Delete all players from a team
    void deleteAllPlayersFromTeam(UUID teamId);
    
    // Delete a specific player from a team
    void removePlayerFromTeam(UUID playerId);
    void removePlayersFromTeam(UUID teamId,List<UUID> playerIds);
    Optional<Boolean> registerBatchPlayerWithBasicInfo(Set<Player> player);

    List<Player> getPlayersByName(String playerName);
}