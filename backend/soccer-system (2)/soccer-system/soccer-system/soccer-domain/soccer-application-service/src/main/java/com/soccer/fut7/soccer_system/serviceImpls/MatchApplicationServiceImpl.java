package com.soccer.fut7.soccer_system.serviceImpls;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;
import com.soccer.fut7.soccer_system.ports.input.service.MatchApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerMatch;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Lazy

@RequiredArgsConstructor
public class MatchApplicationServiceImpl implements MatchApplicationService {

    private final CommandHandlerMatch commandHandlerMatch;

    @Override
    public Set<MatchTinyDetails> getAllMatchesByCategory(UUID categoryId) {
        return commandHandlerMatch.getAllMatchesByCategory(categoryId);
    }

    @Override
    public Match updateMatchStats(UUID matchId,UUID tourmentId,MatchResults matchResults) {
        return commandHandlerMatch.updateMatchStats(matchId,tourmentId,matchResults);
    }

    @Override
    public Boolean updateMatchStatus(UUID matchId,UUID tourmentId, MatchStatus status) {
        return commandHandlerMatch.updateMatchStatus(matchId,tourmentId, status);
    }

    @Override
    public Match createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate, UUID refereeId,UUID categoryId) {
        return commandHandlerMatch.createMatch(team1Id, team2Id, matchDate, refereeId,categoryId);
    }

    @Override
    public List<Match> getMatchesByTeamWithStats(UUID teamId,UUID tourment_id) {
        return commandHandlerMatch.getMatchesByTeamWithStats(teamId);
    }

    @Override
    public List<Match> getMatchesByTeamWithoutStats(UUID teamId,UUID tourment_id) {
        return commandHandlerMatch.getMatchesByTeamWithoutStats(teamId,tourment_id);
    }

    @Override
    public Match getMatchByIdWithoutStats(UUID matchId,UUID tourment_id) {
        return commandHandlerMatch.getMatchByIdWithoutStats(matchId,tourment_id);
    }

    @Override
    public Match getMatchByIdWithStats(UUID matchId,UUID tourment_id) {
        return commandHandlerMatch.getMatchByIdWithStats(matchId,tourment_id);
    }

    @Override
    public List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id) {
        return commandHandlerMatch.getMatchesBetweenTeamsWithStats(team1Id, team2Id);
    }

    @Override
    public List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id) {
        return commandHandlerMatch.getMatchesBetweenTeamsWithoutStats(team1Id, team2Id);
    }
}