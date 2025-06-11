package com.soccer.fut7.soccer_system.team.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails.InnerCustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.ValueObject.Cards;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.InfoTeamMatch;
import com.soccer.fut7.soccer_system.ValueObject.JerseyNumber;
import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.ValueObject.TeamName;
import com.soccer.fut7.soccer_system.ports.outport.MatchRepository;
import com.soccer.fut7.soccer_system.ports.outport.TourmentRepository;
import com.soccer.fut7.soccer_system.team.helpers.*;
import com.soccer.fut7.soccer_system.team.mapper.MatchMapper;
import com.soccer.fut7.soccer_system.team.entitiy.*;
import com.soccer.fut7.soccer_system.team.repository.*;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class MatchAdapter implements MatchRepository {

        private final TeamMatchStatsRepositoryData teamMatchStatsRepositoryData;
        private final MatchCommandHelperRepository matchCommandHelperRepository;
        private final MatchMapper matchMapper;
        private final TeamRepositoryData teamRepositoryData;
        private final TeamStatsRepositoryData teamStatsRepositoryData;
        private final CategoryRepositoryData categoryRepositoryData;
        private final TournamentRepositoryData tourmentRepositoryData;
        private final UserRepositoryData userRepositoryData;

        @Override
        public List<CustomMatchDetails> getAllMatchesByCategory(UUID categoryId) {

                CategoryEntity category = categoryRepositoryData.findById(categoryId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Category not found with id: " + categoryId));

                List<CustomMatchDetails> matches = matchCommandHelperRepository.getAllMatchesByCategory(categoryId)
                                .stream()
                                .map(matchMapper::convertToCustomMatchDetails)
                                .peek(match -> {
                                        TournamentEntity tournament = tourmentRepositoryData
                                                        .findById(match.getTournament_id())
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Tournament not found with id: "
                                                                                        + match.getTournament_id()));
                                        match.setTourmentName(tournament.getTournamentName());
                                        match.setCategory(category.getCategoryName());
                                })
                                .collect(Collectors.toList());
                return matches;
        }

        @Override
        public Optional<Match> getMatchByIdWithoutStats(UUID matchId, UUID tourment_id) {
                return matchCommandHelperRepository.getMatchByIdWithoutStats(matchId, tourment_id)
                                .map(matchEntity -> {
                                        Match match = matchMapper.toDomain(matchEntity);
                                        // enrichMatchWithoutStats(match, matchEntity);
                                        return match;
                                });
        }

        @Override
        public Optional<Match> getMatchByIdWithStats(UUID matchId, UUID tournamentId) {
            return matchCommandHelperRepository.getMatchByIdWithStats(matchId, tournamentId)
                    .map(matchEntity -> {
                        // Handle null referee case
                        UserEntity refereeEntity = matchEntity.getReferee() != null 
                        ? userRepositoryData.findById(matchEntity.getReferee().getId())
                            .orElse(null)  // Return null if referee not found in database
                        : null;  // Return null if no referee in matchEntity
                    
                    // Then only set referee if we have one
                    if (refereeEntity != null) {
                        matchEntity.setReferee(
                            UserEntity.builder()
                                .id(refereeEntity.getId())
                                .firstName(refereeEntity.getFirstName())
                                .lastName(refereeEntity.getLastName())
                                .email(refereeEntity.getEmail())
                                .birthDate(refereeEntity.getBirthDate())
                                .photoUrl(refereeEntity.getPhotoUrl())
                                .build()
                        );
                    }
        
                        matchEntity.setReferee(refereeEntity);
                        Match match = matchMapper.toDomain(matchEntity);
                        enrichMatchWithStats(match, matchEntity);
                        return match;
                    });
        }

        @Override
        public Optional<Match> updateMatchStats(UUID matchId, UUID tournamentId, MatchResults matchResults) {
                return matchCommandHelperRepository.getMatchByIdWithoutStats(matchId, tournamentId)
                                .map(matchEntity -> {
                                        // Determine match outcome for both teams
                                        int homePoints = calculateTeamPoints(
                                                        matchResults.getHomeTeam().goalsWin().value(),
                                                        matchResults.getHomeTeam().goalsAgainst().value());
                                        int awayPoints = calculateTeamPoints(
                                                        matchResults.getAwayTeam().goalsWin().value(),
                                                        matchResults.getAwayTeam().goalsAgainst().value());

                                        // Update team match stats (direct match statistics)
                                        matchCommandHelperRepository.updateTeamMatchStats(
                                                        matchId,
                                                        matchResults.getHomeTeam().id(),
                                                        matchResults.getHomeTeam().goalsWin().value(),
                                                        matchResults.getHomeTeam().goalsAgainst().value(),
                                                        homePoints);

                                        matchCommandHelperRepository.updateTeamMatchStats(
                                                        matchId,
                                                        matchResults.getAwayTeam().id(),
                                                        matchResults.getAwayTeam().goalsWin().value(),
                                                        matchResults.getAwayTeam().goalsAgainst().value(),
                                                        awayPoints);

                                        // Calculate match outcome counters
                                        int homeWon = homePoints == 3 ? 1 : 0;
                                        int homeDrawn = homePoints == 1 ? 1 : 0;
                                        int homeLost = homePoints == 0 ? 1 : 0;

                                        int awayWon = awayPoints == 3 ? 1 : 0;
                                        int awayDrawn = awayPoints == 1 ? 1 : 0;
                                        int awayLost = awayPoints == 0 ? 1 : 0;

                                        // Update or insert home team cumulative stats
                                        upsertTeamStats(
                                                        matchResults.getHomeTeam().id(),
                                                        matchResults.getHomeTeam().goalsWin().value(),
                                                        matchResults.getHomeTeam().goalsAgainst().value(),
                                                        homePoints,
                                                        1, // matchesPlayed
                                                        homeWon,
                                                        homeDrawn,
                                                        homeLost);

                                        // Update or insert away team cumulative stats
                                        upsertTeamStats(
                                                        matchResults.getAwayTeam().id(),
                                                        matchResults.getAwayTeam().goalsWin().value(),
                                                        matchResults.getAwayTeam().goalsAgainst().value(),
                                                        awayPoints,
                                                        1, // matchesPlayed
                                                        awayWon,
                                                        awayDrawn,
                                                        awayLost);

                                        // Update player stats if provided
                                        if (matchResults.getHomeTeam().infoPlayerMatchStats() != null) {
                                                matchResults.getHomeTeam().infoPlayerMatchStats().forEach(
                                                                playerStat -> matchCommandHelperRepository
                                                                                .updatePlayerMatchStats(matchId,
                                                                                                playerStat));
                                        }

                                        if (matchResults.getAwayTeam().infoPlayerMatchStats() != null) {
                                                matchResults.getAwayTeam().infoPlayerMatchStats().forEach(
                                                                playerStat -> matchCommandHelperRepository
                                                                                .updatePlayerMatchStats(matchId,
                                                                                                playerStat));
                                        }

                                        // Update match status and winner if not already done

                                        // matchEntity.setMatchStatus(MatchStatus.JUGADO.toString());

                                        // Set winner team based on points
                                        if (homePoints > awayPoints) {
                                                matchEntity.setWinnerTeam(matchEntity.getHomeTeam());
                                        } else if (awayPoints > homePoints) {
                                                matchEntity.setWinnerTeam(matchEntity.getAwayTeam());
                                        }


                                        UserEntity referee = userRepositoryData
                                                        .findById(matchResults.getRefereeId())
                                                        .orElseThrow(() -> new EntityNotFoundException("Referee with id " + matchResults.getRefereeId() + " not found."));
                                        matchEntity.setReferee(
                                                        UserEntity.builder()
                                                                        .id(referee.getId()
                                                                        ).age(referee.getAge())
                                                                        .email(referee.getEmail())
                                                                        .firstName(referee.getFirstName() + " " + referee.getLastName())
                                                                        
                                                                        .build()
                                                                        
                                                                        
                                                                        );

                                        matchEntity.setMatchDate(matchResults.getMatchDate());
                                        matchEntity.setMatchStatus(matchResults.getStatus().toString());

                                        // If points are equal, winner remains null (draw)
                                        matchCommandHelperRepository.updateMatch(matchEntity);

                                        return getMatchByIdWithStats(matchId, tournamentId);
                                })
                                .orElse(Optional.empty());
        }

        private void upsertTeamStats(UUID teamId, int goals, int goalsAgainst, int points,
                        int matchesPlayed, int matchesWon, int matchesDrawn, int matchesLost) {
                // First try to update existing stats
                int updatedRows = teamStatsRepositoryData.updateTeamStatsIfExists(
                                teamId,
                                goals,
                                goalsAgainst,
                                points,
                                matchesPlayed,
                                matchesWon,
                                matchesDrawn,
                                matchesLost);

                // If no rows were updated (stats didn't exist), insert new stats
                if (updatedRows == 0) {
                        teamStatsRepositoryData.insertTeamStats(
                                        teamId,
                                        goals,
                                        goalsAgainst,
                                        points,
                                        matchesPlayed,
                                        matchesWon,
                                        matchesDrawn,
                                        matchesLost);
                }
        }

        private int calculateTeamPoints(int goalsScored, int goalsConceded) {
                if (goalsScored > goalsConceded)
                        return 3;
                if (goalsScored == goalsConceded)
                        return 1;
                return 0;
        }

        @Override
        public Optional<Boolean> updateMatchStatus(UUID matchId, UUID tournamentId, MatchStatus status) {
                return matchCommandHelperRepository.updateMatchStatus(matchId, tournamentId, status);
        }

        @Override
        public Optional<Match> createMatch(UUID team1Id, UUID team2Id, LocalDate matchDate, UUID refereeId,
                        UUID categoryId) {
                // Verify teams exist before creating match
                Optional<TeamEntity> homeTeam = teamRepositoryData.findById(team1Id);
                Optional<TeamEntity> awayTeam = teamRepositoryData.findById(team2Id);

                if (homeTeam.isEmpty() || awayTeam.isEmpty()) {
                        throw new IllegalArgumentException("One or both teams not found");
                }

                // Both teams should be in the same category
                if (!homeTeam.get().getCategory().getId().equals(awayTeam.get().getCategory().getId())) {
                        throw new IllegalArgumentException("Teams must be in the same category");
                }

                return matchCommandHelperRepository.createMatch(
                                homeTeam.get(),
                                awayTeam.get(),
                                matchDate, refereeId, categoryId).map(matchMapper::toDomain);
        }

        @Override
        public List<Match> getMatchesByTeamWithStats(UUID teamId) {
                return matchCommandHelperRepository.getMatchesByTeam(teamId)
                                .stream()
                                .map(matchEntity -> {
                                        Match match = matchMapper.toDomain(matchEntity);
                                        enrichMatchWithStats(match, matchEntity);
                                        return match;
                                })
                                .collect(Collectors.toList());
        }

        @Override
        public List<Match> getMatchesByTeamWithoutStats(UUID teamId, UUID tourment_id) {
                return matchCommandHelperRepository.getMatchesByTeam(teamId)
                                .stream()
                                .map(matchMapper::toDomain)
                                .collect(Collectors.toList());
        }

        @Override
        public List<Match> getMatchesBetweenTeamsWithStats(UUID team1Id, UUID team2Id) {
                return matchCommandHelperRepository.getMatchesBetweenTeams(team1Id, team2Id)
                                .stream()
                                .map(matchEntity -> {
                                        Match match = matchMapper.toDomain(matchEntity);
                                        enrichMatchWithStats(match, matchEntity);
                                        return match;
                                })
                                .collect(Collectors.toList());
        }

        @Override
        public List<Match> getMatchesBetweenTeamsWithoutStats(UUID team1Id, UUID team2Id) {
                return matchCommandHelperRepository.getMatchesBetweenTeams(team1Id, team2Id)
                                .stream()
                                .map(matchMapper::toDomain)
                                .collect(Collectors.toList());
        }

        private void enrichMatchWithStats(Match match, MatchEntity matchEntity) {
                // Get team match stats
                // List<TeamMatchStatsEntity> teamMatchStats = matchCommandHelperRepository
                // .getTeamMatchStatsByMatch(matchEntity.getId());

                // Get player match stats
                List<PlayerMatchStatsEntity> playerMatchStats = matchCommandHelperRepository
                                .getPlayerMatchStatsByMatch(matchEntity.getId());

                // Build match results with stats
                if (Objects.nonNull(matchEntity.getHomeTeam()) && Objects.nonNull(matchEntity.getAwayTeam())) {
                        Set<PlayerMatchStats> homePlayerStats = playerMatchStats.stream()
                                        .filter(stats -> stats.getPlayer().getTeam().getId()
                                                        .equals(matchEntity.getHomeTeam().getId()))
                                        .map(this::convertToPlayerMatchStats)
                                        .collect(Collectors.toSet());

                        Set<PlayerMatchStats> awayPlayerStats = playerMatchStats.stream()
                                        .filter(stats -> stats.getPlayer().getTeam().getId()
                                                        .equals(matchEntity.getAwayTeam().getId()))
                                        .map(this::convertToPlayerMatchStats)
                                        .collect(Collectors.toSet());

                        List<TeamMatchStatsEntity> statsTeams = teamMatchStatsRepositoryData
                                        .findByMatch_Id(matchEntity.getId());

                        TeamMatchStatsEntity homeTeamStats = statsTeams.stream()
                                        .filter(stats -> stats.getTeam().getId()
                                                        .equals(matchEntity.getHomeTeam().getId()))
                                        .findFirst()
                                        .orElse(null);

                        TeamMatchStatsEntity awayTeamStats = statsTeams.stream()
                                        .filter(stats -> stats.getTeam().getId()
                                                        .equals(matchEntity.getAwayTeam().getId()))
                                        .findFirst()
                                        .orElse(null);
                        InfoTeamMatch homeTeamInfo = new InfoTeamMatch(
                                        matchEntity.getHomeTeam().getTeamName(),
                                        matchEntity.getHomeTeam().getId(),
                                        Goals.of(homeTeamStats.getGoals()),
                                        Goals.of(homeTeamStats.getGoalsAgainst()),
                                        Points.of(homeTeamStats.getPoints()),
                                        homePlayerStats);

                        InfoTeamMatch awayTeamInfo = new InfoTeamMatch(
                                        matchEntity.getAwayTeam().getTeamName(),
                                        matchEntity.getAwayTeam().getId(),
                                        Goals.of(awayTeamStats.getGoals()),
                                        Goals.of(awayTeamStats.getGoalsAgainst()),
                                        Points.of(awayTeamStats.getPoints()),
                                        awayPlayerStats);

                                        MatchResults matchResults = new MatchResults(
                                                matchEntity.getId(),
                                                homeTeamInfo,
                                                awayTeamInfo,
                                                matchEntity.getReferee() != null ? matchEntity.getReferee().getId() : null,
                                                matchEntity.getMatchDate(),
                                                MatchStatus.fromString(Optional.ofNullable(matchEntity.getMatchStatus()).orElse("PENDIENTE")));

                        Team teamWon = null;
                        Team teamLost = null;

                        if (homeTeamStats.getPoints() > awayTeamStats.getPoints()) {
                                teamWon = Team.builder()
                                                .id(matchResults.getHomeTeam().id())
                                                .name(TeamName.of(matchResults.getHomeTeam().name()))
                                                .build();

                                teamLost = Team.builder()
                                                .id(matchResults.getAwayTeam().id())
                                                .name(TeamName.of(matchResults.getAwayTeam().name()))
                                                .build();

                        } else if (awayTeamStats.getPoints() > homeTeamStats.getPoints()) {
                                teamWon = Team.builder()
                                                .id(matchResults.getAwayTeam().id())
                                                .name(TeamName.of(matchResults.getAwayTeam().name()))
                                                .build();

                                teamLost = Team.builder()
                                                .id(matchResults.getHomeTeam().id())
                                                .name(TeamName.of(matchResults.getHomeTeam().name()))
                                                .build();

                        } else {
                                // Empate, puedes asignar null o manejarlo de otra forma si tu modelo lo permite
                                teamWon = null;
                                teamLost = null;
                        }
                        match.setResults(matchResults);

                        match.setWonTeam(teamWon);
                        match.setLostTeam(teamLost);

                }
        }

        private void enrichMatchWithoutStats(Match match, MatchEntity matchEntity) {

                Set<PlayerMatchStats> homePlayerStats = null;
                Set<PlayerMatchStats> awayPlayerStats = null;
                List<TeamMatchStatsEntity> statsTeams = teamMatchStatsRepositoryData
                                .findByMatch_Id(matchEntity.getId());

                TeamMatchStatsEntity homeTeamStats = statsTeams.stream()
                                .filter(stats -> stats.getTeam().getId().equals(matchEntity.getHomeTeam().getId()))
                                .findFirst()
                                .orElse(null);

                TeamMatchStatsEntity awayTeamStats = statsTeams.stream()
                                .filter(stats -> stats.getTeam().getId().equals(matchEntity.getAwayTeam().getId()))
                                .findFirst()
                                .orElse(null);
                InfoTeamMatch homeTeamInfo = new InfoTeamMatch(
                                matchEntity.getHomeTeam().getTeamName(),
                                matchEntity.getHomeTeam().getId(),
                                Goals.of(homeTeamStats.getGoals()),
                                Goals.of(homeTeamStats.getGoalsAgainst()),
                                Points.of(homeTeamStats.getPoints()),
                                homePlayerStats);

                InfoTeamMatch awayTeamInfo = new InfoTeamMatch(
                                matchEntity.getAwayTeam().getTeamName(),
                                matchEntity.getAwayTeam().getId(),
                                Goals.of(awayTeamStats.getGoals()),
                                Goals.of(awayTeamStats.getGoalsAgainst()),
                                Points.of(awayTeamStats.getPoints()),
                                awayPlayerStats);

                MatchResults matchResults = new MatchResults(
                                matchEntity.getId(),
                                homeTeamInfo,
                                awayTeamInfo, matchEntity.getReferee().getId(),
                                matchEntity.getMatchDate(),
                                MatchStatus.fromString(Optional.ofNullable(matchEntity.getMatchStatus()).orElse("PENDIENTE")));

                match.setResults(matchResults);

        }

        private PlayerMatchStats convertToPlayerMatchStats(PlayerMatchStatsEntity entity) {
                return PlayerMatchStats.builder()
                                .idTeam(entity.getPlayer().getTeam().getId())
                                .idPlayer(entity.getPlayer().getId())
                                .namePlayer(entity.getPlayer().getFirstName() + " " + entity.getPlayer().getLastName())
                                .jerseyNumber(new JerseyNumber(entity.getPlayer().getJerseyNumber()))
                                .goals(new Goals(entity.getGoals()))
                                .points(new Points(entity.getPoints() != null ? entity.getPoints() : 0))
                                .attended(entity.getAttended())
                                .cards(new Cards(entity.getYellowCards(), entity.getRedCards()))
                                .build();
        }
}