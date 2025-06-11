package com.soccer.fut7.soccer_system.ports.outport;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;

@Repository
public interface PlayerMatchStatsRepository {
    // Create a player stat from a match
    Optional<PlayerMatchStats> updateOrCreatePlayerStatsFromMatch(PlayerMatchStats statsRecord);
    Optional<Set<PlayerMatchStatsRecordDto>> updateOrCreatePlayerStatsFromMatchBatch(Set<PlayerMatchStats> statsRecord);



    // Update player stats with match information
    void updatePlayerStats(PlayerMatchStats statsRecord);

    // Delete a specific player stat
    void deletePlayerStat(UUID playerId, UUID matchId);

    // Delete all user stats from a match
    void deleteAllUserStatsFromMatch(UUID matchId);

    // Delete a specific user stat from a match
    void deleteUserStatFromMatch(UUID matchId, UUID userId);
}