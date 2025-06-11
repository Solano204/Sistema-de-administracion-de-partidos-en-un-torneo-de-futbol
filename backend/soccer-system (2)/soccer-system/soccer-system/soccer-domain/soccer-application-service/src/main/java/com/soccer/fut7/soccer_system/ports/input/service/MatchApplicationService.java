package com.soccer.fut7.soccer_system.ports.input.service;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface MatchApplicationService {
    Set<MatchTinyDetails> getAllMatchesByCategory(UUID categoryId);
    Match updateMatchStats(UUID matchId,UUID tourment_Id, MatchResults matchResults);
    Boolean updateMatchStatus(UUID matchId,UUID tourment_id, MatchStatus status);
    Match createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate, UUID refereeId,UUID categoryId);
    List<Match> getMatchesByTeamWithStats(UUID teamId,UUID tourment_id);
    List<Match> getMatchesByTeamWithoutStats(UUID teamId,UUID tourment_id);
    Match getMatchByIdWithoutStats(UUID matchId,UUID tourment_id);
    Match getMatchByIdWithStats(UUID matchId,UUID tourment_id);
    List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id);
    List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id);
}