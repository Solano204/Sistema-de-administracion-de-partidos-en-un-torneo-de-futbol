package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ExceptionApplication.MatchException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.MatchRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Lazy

@RequiredArgsConstructor
public class CommandHelperMatch {
    private final EntityDtoMapperDomain mapper;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;

    public Set<MatchTinyDetails> getAllMatchesByCategory(UUID categoryId) {
        return matchRepository.getAllMatchesByCategory(categoryId).stream()
                .map(m -> mapper.matchToMatchTinyDetails(m))
                .collect(Collectors.toSet());
    }

    @Transactional
    public Match updateMatchStats(UUID matchId, UUID tourment_id, MatchResults matchResults) {
        return matchRepository.updateMatchStats(matchId, tourment_id, matchResults)
                .orElseThrow(() -> new MatchException("Failed to update match stats"));
    }

    @Transactional
    public Boolean updateMatchStatus(UUID matchId, UUID tourment_id, MatchStatus status) {
        return matchRepository.updateMatchStatus(matchId, tourment_id, status)
                .orElseThrow(() -> new MatchException("Failed to update match status"));
    }

    @Transactional
    public Match createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate, UUID refereeId, UUID categoryId) {
        // Validate teams exist
        teamRepository.existTeam(team1Id)
                .orElseThrow(() -> new teamException("Home team not found"));
        teamRepository.existTeam(team2Id)
                .orElseThrow(() -> new teamException("Away team not found"));

        return matchRepository.createMatch(team1Id, team2Id, matchDate, refereeId, categoryId)
                .orElseThrow(() -> new MatchException("Failed to create match"));
    }

    public List<Match> getMatchesByTeamWithStats(UUID teamId) {
        // Validate team exists
        teamRepository.existTeam(teamId)
                .orElseThrow(() -> new teamException("Team not found"));

        return matchRepository.getMatchesByTeamWithStats(teamId);
    }

    public List<Match> getMatchesByTeamWithoutStats(UUID teamId, UUID tourment_id) {
        // Validate team exists
        teamRepository.existTeam(teamId)
                .orElseThrow(() -> new teamException("Team not found"));

        return matchRepository.getMatchesByTeamWithoutStats(teamId, tourment_id);
    }

    public Match getMatchByIdWithoutStats(UUID matchId, UUID tourment_id) {
        return matchRepository.getMatchByIdWithoutStats(matchId, tourment_id)
                .orElseThrow(() -> new MatchException("Match not found"));
    }

    public Match getMatchByIdWithStats(UUID matchId, UUID tourment_id) {
        Match matc = matchRepository.getMatchByIdWithStats(matchId, tourment_id)
                .orElseThrow(() -> new MatchException("Match not found"));
        return matc;
    }

    public List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id) {
        // Validate teams exist
        teamRepository.existTeam(team1Id)
                .orElseThrow(() -> new teamException("Team 1 not found"));
        teamRepository.existTeam(team2Id)
                .orElseThrow(() -> new teamException("Team 2 not found"));

        return matchRepository.getMatchesBetweenTeamsWithStats(team1Id, team2Id);
    }

    public List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id) {
        // Validate teams exist
        teamRepository.existTeam(team1Id)
                .orElseThrow(() -> new teamException("Team 1 not found"));
        teamRepository.existTeam(team2Id)
                .orElseThrow(() -> new teamException("Team 2 not found"));

        return matchRepository.getMatchesBetweenTeamsWithoutStats(team1Id, team2Id);
    }

}