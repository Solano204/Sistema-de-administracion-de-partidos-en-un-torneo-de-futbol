package com.soccer.fut7.soccer_system.team.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO;
import com.soccer.fut7.soccer_system.team.entitiy.JourneyEntity;
import com.soccer.fut7.soccer_system.team.entitiy.MatchEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamMatchStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;

@Component
public class MatchMapperProjection {

    public List<MatchEntity> mapMatchesWithTeams(List<MatchWithFullDetailsDTO> results) {
        return results.stream().map(row -> {
            MatchEntity match = new MatchEntity();
            match.setId(row.getId());
            match.setMatchDate(row.getMatchDate());
            match.setTournament(TournamentEntity.builder().id(row.getTournamentId()).build());

            // Referee
            UserEntity referee = new UserEntity();
            referee.setId(row.getRefereeId());
            referee.setFirstName(row.getRefereeFirstName());
            referee.setLastName(row.getRefereeLastName());
            match.setReferee(referee);

            // Home team
            TeamEntity homeTeam = new TeamEntity();
            homeTeam.setId(row.getHomeTeamId());
            homeTeam.setTeamName(row.getHomeTeamName());
            homeTeam.setLogoUrl(row.getHomeTeamLogoUrl());
            match.setHomeTeam(homeTeam);

            // Away team
            TeamEntity awayTeam = new TeamEntity();
            awayTeam.setId(row.getAwayTeamId());
            awayTeam.setTeamName(row.getAwayTeamName());
            awayTeam.setLogoUrl(row.getAwayTeamLogoUrl());
            match.setAwayTeam(awayTeam);

            // Winner team
            if (row.getWinnerTeamId() != null) {
                TeamEntity winnerTeam = new TeamEntity();
                winnerTeam.setId(row.getWinnerTeamId());
                winnerTeam.setTeamName(row.getWinnerTeamName());
                winnerTeam.setLogoUrl(row.getWinnerTeamLogoUrl());
                match.setWinnerTeam(winnerTeam);
            }

            // Journey
            if (row.getJourneyId() != null) {
                JourneyEntity journey = new JourneyEntity();
                journey.setId(row.getJourneyId());
                journey.setJourneyNumber(row.getJourneyNumber());
                journey.setStartDate(row.getJourneyStartDate());
                journey.setEndDate(row.getJourneyEndDate());
                match.setJourney(journey);
            }

            match.setPhase(row.getPhase());
            match.setMatchStatus(row.getMatchStatus());

            match.setAwayTeamStats(TeamMatchStatsEntity.builder()
                    .team(TeamEntity.builder().id(row.getAwayTeamId()).teamName(row.getAwayTeamName())
                            .logoUrl(row.getAwayTeamLogoUrl()).build())
                    .build());

            match.setHomeTeamStats(TeamMatchStatsEntity.builder()
                    .team(TeamEntity.builder().id(row.getHomeTeamId()).teamName(row.getHomeTeamName())
                            .logoUrl(row.getHomeTeamLogoUrl()).build())
                    .build());
            return match;
        }).collect(Collectors.toList());
    }
    public MatchEntity mapMatchesWithTeams(MatchWithFullDetailsDTO row) {
            MatchEntity match = new MatchEntity();
            match.setId(row.getId());
            match.setMatchDate(row.getMatchDate());
            match.setTournament(TournamentEntity.builder().id(row.getTournamentId()).build());

            // Referee
            UserEntity referee = new UserEntity();
            referee.setId(row.getRefereeId());
            referee.setFirstName(row.getRefereeFirstName());
            referee.setLastName(row.getRefereeLastName());
            match.setReferee(referee);

            // Home team
            TeamEntity homeTeam = new TeamEntity();
            homeTeam.setId(row.getHomeTeamId());
            homeTeam.setTeamName(row.getHomeTeamName());
            homeTeam.setLogoUrl(row.getHomeTeamLogoUrl());
            match.setHomeTeam(homeTeam);

            // Away team
            TeamEntity awayTeam = new TeamEntity();
            awayTeam.setId(row.getAwayTeamId());
            awayTeam.setTeamName(row.getAwayTeamName());
            awayTeam.setLogoUrl(row.getAwayTeamLogoUrl());
            match.setAwayTeam(awayTeam);

            // Winner team
            if (row.getWinnerTeamId() != null) {
                TeamEntity winnerTeam = new TeamEntity();
                winnerTeam.setId(row.getWinnerTeamId());
                winnerTeam.setTeamName(row.getWinnerTeamName());
                winnerTeam.setLogoUrl(row.getWinnerTeamLogoUrl());
                match.setWinnerTeam(winnerTeam);
            }

            // Journey
            if (row.getJourneyId() != null) {
                JourneyEntity journey = new JourneyEntity();
                journey.setId(row.getJourneyId());
                journey.setJourneyNumber(row.getJourneyNumber());
                journey.setStartDate(row.getJourneyStartDate());
                journey.setEndDate(row.getJourneyEndDate());
                match.setJourney(journey);
            }

            match.setPhase(row.getPhase());
            match.setMatchStatus(row.getMatchStatus());

            match.setAwayTeamStats(TeamMatchStatsEntity.builder()
                    .team(TeamEntity.builder().id(row.getAwayTeamId()).teamName(row.getAwayTeamName())
                            .logoUrl(row.getAwayTeamLogoUrl()).build())
                    .build());

            match.setHomeTeamStats(TeamMatchStatsEntity.builder()
                    .team(TeamEntity.builder().id(row.getHomeTeamId()).teamName(row.getHomeTeamName())
                            .logoUrl(row.getHomeTeamLogoUrl()).build())
                    .build());
            return match;
    }
}
