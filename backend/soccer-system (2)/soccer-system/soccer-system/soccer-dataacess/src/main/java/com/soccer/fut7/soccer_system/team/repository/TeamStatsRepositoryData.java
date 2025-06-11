package com.soccer.fut7.soccer_system.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;

@Repository
public interface TeamStatsRepositoryData extends JpaRepository<TeamStatsEntity, UUID> {
    List<TeamStatsEntity> findByTeam_Category_IdOrderByPointsDesc(UUID categoryId);

    List<TeamStatsEntity> findByTeam_Category_Id(UUID categoryId);

    @Query("SELECT ts FROM TeamStatsEntity ts WHERE ts.team.id = :teamId")
    Optional<TeamStatsEntity> findStatsByTeamId(@Param("teamId") UUID teamId);

    // For updating existing team stats
    @Modifying
    @Query("UPDATE TeamStatsEntity ts " +
            "SET ts.goals = ts.goals + :goals, " +
            "    ts.goalsAgainst = ts.goalsAgainst + :goalsAgainst, " +
            "    ts.matchesPlayed = ts.matchesPlayed + 1, " +
            "    ts.points = ts.points + :points " +
            "WHERE ts.team.id = :teamId")
    int updateTeamStatsIfExists(
            @Param("teamId") UUID teamId,
            @Param("goals") int goals,
            @Param("goalsAgainst") int goalsAgainst,
            @Param("points") int points);


            
    // For inserting new team stats
    @Modifying
@Query(value = "INSERT INTO fut_jaguar.team_stats " +
        "(id, team_id, division_id, goals_for, goals_against, matches_played, " +
        "matches_won, matches_drawn, matches_lost, points, yellow_cards, red_cards) " +
        "VALUES (gen_random_uuid(), :teamId, null, :goalsFor, :goalsAgainst, :matchesPlayed, " +
        ":matchesWon, :matchesDrawn, :matchesLost, :points, 0, 0)", nativeQuery = true)
void insertTeamStats(
        @Param("teamId") UUID teamId,
        @Param("goalsFor") int goalsFor,
        @Param("goalsAgainst") int goalsAgainst,
        @Param("points") int points,
        @Param("matchesPlayed") int matchesPlayed,
        @Param("matchesWon") int matchesWon,
        @Param("matchesDrawn") int matchesDrawn,
        @Param("matchesLost") int matchesLost);



            @Modifying
@Query("UPDATE TeamStatsEntity ts " +
       "SET ts.goals = ts.goals + :goals, " +
       "    ts.goalsAgainst = ts.goalsAgainst + :goalsAgainst, " +
       "    ts.points = ts.points + :points, " +
       "    ts.matchesPlayed = ts.matchesPlayed + :matchesPlayed, " +
       "    ts.matchesWon = ts.matchesWon + :matchesWon, " +
       "    ts.matchesDrawn = ts.matchesDrawn + :matchesDrawn, " +
       "    ts.matchesLost = ts.matchesLost + :matchesLost " +
       "WHERE ts.team.id = :teamId")
int updateTeamStatsIfExists(
        @Param("teamId") UUID teamId,
        @Param("goals") int goals,
        @Param("goalsAgainst") int goalsAgainst,
        @Param("points") int points,
        @Param("matchesPlayed") int matchesPlayed,
        @Param("matchesWon") int matchesWon,
        @Param("matchesDrawn") int matchesDrawn,
        @Param("matchesLost") int matchesLost);
}
