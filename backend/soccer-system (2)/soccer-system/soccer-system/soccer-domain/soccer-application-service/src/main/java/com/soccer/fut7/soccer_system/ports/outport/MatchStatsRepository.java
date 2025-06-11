package com.soccer.fut7.soccer_system.ports.outport;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.EntityApplication.Stats;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;

@Repository
public interface MatchStatsRepository {
    // Update match stats for a specific category and match
    Optional<Match> updateMatchStats(UUID categoryId, UUID matchId, MatchResults statsRecord);

    // Get a match with full information including stats
    Optional<Match> getMatchWithFullDetails(UUID categoryId, UUID matchId);

    // Delete all match stats for a match
    void deleteAllMatchStatsForMatch(UUID matchId);

    // Delete all match stats for a team
    void deleteAllMatchStatsForTeam(UUID teamId);

    // Delete a specific match stat
    void deleteMatchStatEntry(UUID matchStatsId);
}