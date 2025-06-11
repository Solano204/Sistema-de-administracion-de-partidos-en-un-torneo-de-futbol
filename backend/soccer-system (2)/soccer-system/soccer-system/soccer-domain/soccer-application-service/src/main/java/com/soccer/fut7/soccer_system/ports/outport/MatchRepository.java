package com.soccer.fut7.soccer_system.ports.outport;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchDetailsRecord;

@Repository
public interface MatchRepository {
    // Get all matches from a category (only idMatch, NameTeam1, and NameTeam2)
    List<CustomMatchDetails> getAllMatchesByCategory(UUID categoryId);

    // Update match stats
    Optional<Match> updateMatchStats(UUID matchId,UUID tourment_id,  MatchResults matchResults);

    // Update match status
    Optional<Boolean> updateMatchStatus(UUID matchId,UUID tourment_id, MatchStatus status);

    // Create a match with minimal information
    Optional<Match> createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate,UUID refereeId,UUID categoryId);

    // Get all matches for a team with stats
    List<Match> getMatchesByTeamWithStats(UUID teamId);

    // Get all matches for a team without stats
    List<Match> getMatchesByTeamWithoutStats(UUID teamId,UUID tourment_id);

    // Get match by ID without stats
    Optional<Match> getMatchByIdWithoutStats(UUID matchId,UUID tourment_id);

    // Get match by ID with stats
    Optional<Match> getMatchByIdWithStats(UUID matchId,UUID tourment_id);

    // Get matches between two teams with stats
    List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id);

    // Get matches between two teams without stats
    List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id);
}