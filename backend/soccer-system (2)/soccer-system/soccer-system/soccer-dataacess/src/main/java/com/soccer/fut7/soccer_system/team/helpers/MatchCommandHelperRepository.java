package com.soccer.fut7.soccer_system.team.helpers;

import java.time.LocalDate;
import java.util.*;
import java.util.Locale.Category;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.repository.*;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.ExceptionApplication.PlayerStatsException;
import com.soccer.fut7.soccer_system.ExceptionApplication.categoryException;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO;
import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithTeamsDTO;
import com.soccer.fut7.soccer_system.team.entitiy.*;
import com.soccer.fut7.soccer_system.team.mapper.MatchMapper;
import com.soccer.fut7.soccer_system.team.mapper.MatchMapperProjection;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class MatchCommandHelperRepository {
    private final MatchRepositoryData matchRepositoryData;
    private final TeamMatchStatsRepositoryData teamMatchStatsRepositoryData;
    private final PlayerRepositoryData playerEntityRepositoryData;
    private final PlayerMatchStatsRepositoryData playerMatchStatsRepositoryData;
    private final UserRepositoryData userRepositoryData; // For referee assignment
    private final PlayerStatsRepositoryData playerStatsRepositoryData;
    private final CategoryCommandHelperRepository categoryCommandHelperRepository;
    private final MatchMapperProjection matchMapperProjection;

    public List<MatchEntity> getAllMatchesByCategory(UUID categoryId) {
        return matchMapperProjection.mapMatchesWithTeams(matchRepositoryData.findMatchesWithFullDetailsByCategoryId(categoryId));
    }

//     public Optional<MatchEntity> getMatchByIdWithStats(UUID matchId, UUID tourment_id) {
//         matchMapperProjection.mapMatchesWithTeams(matchRepositoryData.findMatchesWithFullDetailsByMatchIdAndTournament(matchId, tourment_id).orElseThrow(() -> new IllegalStateException("Match not found")));
//    }



    public Optional<MatchEntity> getMatchByIdWithoutStats(UUID matchId, UUID tourment_id) {
        Optional<MatchEntity> m =  matchRepositoryData.findByTournament_IdAndIdWithoutStats(tourment_id, matchId);
        return m;
        }

    public Optional<MatchEntity> getMatchByIdWithStats(UUID matchId, UUID tourment_id) {
        return matchRepositoryData.findByTournament_IdAndIdWithStast(tourment_id, matchId);
    }

    public Optional<Boolean> updateMatchStatus(UUID matchId, UUID tournamentId, MatchStatus status) {
        return matchRepositoryData.findByTournament_IdAndIdWithoutStats(matchId, tournamentId)
                .map(match -> {
                    match.setMatchStatus(status.toString());
                    matchRepositoryData.save(match);
                    return true;
                });
    }

    public Optional<MatchEntity> createMatch(TeamEntity homeTeam, TeamEntity awayTeam,
            LocalDate matchDate, UUID refereeId, UUID categoryId) {
        // Validate inputs
        CategoryEntity category = categoryCommandHelperRepository.existCategory(categoryId)
                .orElseThrow(() -> new categoryException("Category not found"));

        UserEntity referee = userRepositoryData.findFirstByUserRoleAndId(UserRole.ARBITRO.toString(), refereeId)
                .orElseThrow(() -> new IllegalStateException("No referees available in the system"));

        // Step 1: Create the match without team references first
        MatchEntity matchEntity = MatchEntity.builder()
                .category(category)
                .matchDate(matchDate)
                .matchStatus(MatchStatus.PENDIENTE.toString())
                .referee(referee)
                .build();

        // Save the match to get an ID
        MatchEntity savedMatch = matchRepositoryData.save(matchEntity);

        // Step 2: Create team match stats with the saved match reference
        TeamMatchStatsEntity homeTeamStats = TeamMatchStatsEntity.builder()
                .match(savedMatch)
                .team(homeTeam)
                .goals(0)
                .goalsAgainst(0)
                .points(0)
                .build();

        TeamMatchStatsEntity awayTeamStats = TeamMatchStatsEntity.builder()
                .match(savedMatch)
                .team(awayTeam)
                .goals(0)
                .goalsAgainst(0)
                .points(0)
                .build();

        // Save team stats
        TeamMatchStatsEntity savedHomeStats = teamMatchStatsRepositoryData.save(homeTeamStats);
        TeamMatchStatsEntity savedAwayStats = teamMatchStatsRepositoryData.save(awayTeamStats);

        // Step 3: Update the match with the team stats references
        savedMatch.setHomeTeamStats(savedHomeStats);
        savedMatch.setAwayTeamStats(savedAwayStats);

        // Final save to complete the relationship
        return Optional.of(matchRepositoryData.save(savedMatch));
    }

    public void updateMatch(MatchEntity matchEntity) {
        matchRepositoryData.save(matchEntity);
    }

    public void updateTeamMatchStats(UUID matchId, UUID teamId, int goals, int goalsAgainst, int points) {
        teamMatchStatsRepositoryData.findByMatch_IdAndTeam_Id(matchId, teamId)
                .ifPresent(stats -> {
                    stats.setGoals(goals);
                    stats.setGoalsAgainst(goalsAgainst);
                    stats.setPoints(points);
                    teamMatchStatsRepositoryData.save(stats);
                });
    }

    public void updatePlayerMatchStats(UUID matchId, PlayerMatchStats playerStats) {
        playerMatchStatsRepositoryData.findByMatch_IdAndPlayer_Id(matchId, playerStats.getIdPlayer())
                .ifPresentOrElse(
                        stats -> {
                            // Update existing stats
                            stats.setGoals(playerStats.getGoals().value());
                            stats.setMatch(matchRepositoryData.findById(matchId).orElseThrow());
                            stats.setPoints(playerStats.getPoints().value());
                            stats.setAttended(playerStats.isAttended());
                            stats.setYellowCards(playerStats.getCards().yellowCards());
                            stats.setRedCards(playerStats.getCards().redCards());

                            playerMatchStatsRepositoryData.save(stats);

                            // Update existing player stats
                            updatePlayerStats(playerStats);
                        },
                        () -> {
                            // Create new player match stats if they don't exist
                            PlayerMatchStatsEntity newStats = new PlayerMatchStatsEntity();
                            newStats.setMatch(matchRepositoryData.findById(matchId).orElseThrow());

                            newStats.setPlayer(playerEntityRepositoryData.findById(playerStats.getIdPlayer())
                                    .orElseThrow(() -> new PlayerStatsException(
                                            "Player not found with ID: " + playerStats.getIdPlayer())));
                            newStats.setGoals(playerStats.getGoals().value());
                            newStats.setPoints(playerStats.getPoints().value());
                            newStats.setAttended(playerStats.isAttended());
                            newStats.setYellowCards(playerStats.getCards().yellowCards());
                            newStats.setRedCards(playerStats.getCards().redCards());

                            playerMatchStatsRepositoryData.save(newStats);

                            // Update player stats (since the player exists)
                            updatePlayerStats(playerStats);
                        });
    }

    // ✅ Extracted method to update player stats (avoiding duplicate code)
    private void updatePlayerStats(PlayerMatchStats playerStats) {
        playerStatsRepositoryData.findByPlayerId(playerStats.getIdPlayer()).ifPresentOrElse(player -> {
            player.setGoals(player.getGoals() + playerStats.getGoals().value());
            player.setPoints(player.getPoints() + playerStats.getPoints().value());
            player.setJerseyNumber(player.getJerseyNumber());
            player.setRedCards(player.getRedCards() + playerStats.getCards().redCards());
            player.setYellowCards(player.getYellowCards() + playerStats.getCards().yellowCards());

            playerStatsRepositoryData.save(player);
        }, () -> {
            // Create new player stats if they don't exist
            PlayerStatsEntity newStats = new PlayerStatsEntity();
            newStats.setPlayer(playerEntityRepositoryData.findById(playerStats.getIdPlayer()).orElseThrow(
                    () -> new PlayerStatsException("Player not found with ID: " + playerStats.getIdPlayer())));
            newStats.setGoals(playerStats.getGoals().value());
            newStats.setPoints(playerStats.getPoints().value());
            newStats.setRedCards(playerStats.getCards().redCards());
            newStats.setYellowCards(playerStats.getCards().yellowCards());
            newStats.setJerseyNumber(playerStats.getJerseyNumber().value());

            playerStatsRepositoryData.save(newStats);
        });
    }

    public List<MatchEntity> getMatchesByTeam(UUID teamId) {
        return matchRepositoryData.findByHomeTeam_IdOrAwayTeam_IdOrderByMatchDateDesc(teamId, teamId);
    }

    public List<MatchEntity> getMatchesBetweenTeams(UUID team1Id, UUID team2Id) {
        return matchRepositoryData.findByHomeTeam_IdAndAwayTeam_IdOrHomeTeam_IdAndAwayTeam_IdOrderByMatchDateDesc(
                team1Id, team2Id, team2Id, team1Id);
    }

    public List<TeamMatchStatsEntity> getTeamMatchStatsByMatch(UUID matchId) {
        return teamMatchStatsRepositoryData.findByMatch_Id(matchId);
    }

    public List<PlayerMatchStatsEntity> getPlayerMatchStatsByMatch(UUID matchId) {
        return playerMatchStatsRepositoryData.findByMatch_Id(matchId);
    }
}