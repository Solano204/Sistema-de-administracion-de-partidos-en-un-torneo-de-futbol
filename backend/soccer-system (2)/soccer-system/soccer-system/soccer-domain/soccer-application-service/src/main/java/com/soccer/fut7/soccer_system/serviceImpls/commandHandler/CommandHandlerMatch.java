package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperMatch;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.rmi.server.UID;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@Lazy

@RequiredArgsConstructor
public class CommandHandlerMatch {

    private final CommandHelperMatch commandHelperMatch;

    public Set<MatchTinyDetails> getAllMatchesByCategory(UUID categoryId) {
        return commandHelperMatch.getAllMatchesByCategory(categoryId);
    }

    public Match updateMatchStats(UUID matchId,UUID tourment_id, MatchResults matchResults) {
        return commandHelperMatch.updateMatchStats(matchId,tourment_id, matchResults);
    }

    public Boolean updateMatchStatus(UUID matchId,UUID tourment_id, MatchStatus status) {
        return commandHelperMatch.updateMatchStatus(matchId,tourment_id, status);
    }

    public Match createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate, UUID refereeId,UUID categoryId) {
        return commandHelperMatch.createMatch(team1Id, team2Id, matchDate, refereeId,categoryId);
    }

    public List<Match> getMatchesByTeamWithStats(UUID teamId) {
        return commandHelperMatch.getMatchesByTeamWithStats(teamId);
    }

    public List<Match> getMatchesByTeamWithoutStats(UUID teamId,UUID tourment_id) {
        return commandHelperMatch.getMatchesByTeamWithoutStats(teamId,tourment_id);
    }

    public Match getMatchByIdWithoutStats(UUID matchId,UUID tourment_id) {
        return commandHelperMatch.getMatchByIdWithoutStats(matchId, tourment_id);
    }

    public Match getMatchByIdWithStats(UUID matchId,UUID tourment_id) {
        return commandHelperMatch.getMatchByIdWithStats(matchId, tourment_id);
    }

    public List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id) {
        return commandHelperMatch.getMatchesBetweenTeamsWithStats(team1Id, team2Id);
    }

    public List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id) {
        return commandHelperMatch.getMatchesBetweenTeamsWithoutStats(team1Id, team2Id);
    }
}
