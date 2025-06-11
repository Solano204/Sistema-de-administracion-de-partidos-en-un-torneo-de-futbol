package com.soccer.fut7.soccer_system.team.repository;

import java.lang.foreign.Linker.Option;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO;
import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithTeamsDTO;
import com.soccer.fut7.soccer_system.team.entitiy.MatchEntity;
import com.soccer.fut7.soccer_system.team.entitiy.MatchSchedule;
import com.soccer.fut7.soccer_system.team.entitiy.TeamMatchStatsEntity;

@Repository
public interface MatchRepositoryData extends JpaRepository<MatchEntity, UUID> {
        List<MatchEntity> findByCategory_IdOrderByMatchDateDesc(UUID categoryId);

        @Query("SELECT m FROM MatchEntity m " +
                        "LEFT JOIN FETCH m.category " + // Only joining homeTeam
                        "LEFT JOIN FETCH m.journey " + // Only joining journey
                        "WHERE m.tournament.id = :tournamentId AND m.id = :matchId")
        Optional<MatchEntity> findByTournament_IdAndIdWithoutStats(
                        @Param("tournamentId") UUID tournamentId,
                        @Param("matchId") UUID matchId);

        List<MatchEntity> findByHomeTeam_IdOrAwayTeam_IdOrderByMatchDateDesc(UUID homeTeamId, UUID awayTeamId);

        @Query("SELECT DISTINCT m FROM MatchEntity m " +
                        "LEFT JOIN FETCH m.journey " +
                        "LEFT JOIN FETCH m.homeTeam " +
                        "LEFT JOIN FETCH m.awayTeam " +
                        "LEFT JOIN FETCH m.winnerTeam " +
                        "LEFT JOIN FETCH m.tournament " +
                        "LEFT JOIN FETCH m.category " +
                        "LEFT JOIN FETCH m.referee " +
                        "WHERE m.tournament.id = :tournamentId AND m.id = :matchId")
        Optional<MatchEntity> findByTournament_IdAndIdWithStast(
                        @Param("tournamentId") UUID tournamentId,
                        @Param("matchId") UUID matchId);

        @Query("""
                        SELECT new com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO(
                            m.id,
                            m.matchDate,
                            m.tournament.id,
                            r.id, r.firstName, r.lastName,
                            ht.id, ht.teamName, ht.logoUrl,
                            at.id, at.teamName, at.logoUrl,
                            j.id, j.journeyNumber, j.startDate, j.endDate,
                            wt.id, wt.teamName, wt.logoUrl,
                            m.phase,
                            m.matchStatus
                        )
                        FROM MatchEntity m
                        LEFT JOIN m.referee r
                        LEFT JOIN m.homeTeam ht
                        LEFT JOIN m.awayTeam at
                        LEFT JOIN m.journey j
                        LEFT JOIN m.winnerTeam wt
                        WHERE m.category.id = :categoryId
                        ORDER BY m.matchDate DESC
                        """)
        List<MatchWithFullDetailsDTO> findMatchesWithFullDetailsByCategoryId(@Param("categoryId") UUID categoryId);

        @Query("""
                        SELECT new com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO(
                            m.id,
                            m.matchDate,
                            m.tournament.id,
                            r.id, r.firstName, r.lastName,
                            ht.id, ht.teamName, ht.logoUrl,
                            at.id, at.teamName, at.logoUrl,
                            j.id, j.journeyNumber, j.startDate, j.endDate,
                            wt.id, wt.teamName, wt.logoUrl,
                            m.phase,
                            m.matchStatus
                        )
                        FROM MatchEntity m
                        LEFT JOIN m.referee r
                        LEFT JOIN m.homeTeam ht
                        LEFT JOIN m.awayTeam at
                        LEFT JOIN m.journey j
                        LEFT JOIN m.winnerTeam wt
                        WHERE m.id = :matchId
                        AND m.tournament.id = :tournamentId
                        ORDER BY m.matchDate DESC
                        """)
        Optional<MatchWithFullDetailsDTO> findMatchesWithFullDetailsByMatchIdAndTournament(
                        @Param("matchId") UUID matchId, @Param("tournamentId") UUID tournamentId);

        @Query("SELECT m FROM MatchEntity m WHERE (m.homeTeam.id = :team1Id AND m.awayTeam.id = :team2Id) OR " +
                        "(m.homeTeam.id = :team3Id AND m.awayTeam.id = :team4Id) ORDER BY m.matchDate DESC")
        List<MatchEntity> findByHomeTeam_IdAndAwayTeam_IdOrHomeTeam_IdAndAwayTeam_IdOrderByMatchDateDesc(
                        UUID team1Id, UUID team2Id, UUID team3Id, UUID team4Id);

        @Query(value = "SELECT * FROM get_matches_in_date_range_fn(:startDate, :endDate)", nativeQuery = true)
        List<MatchSchedule> getMatchesInDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

}