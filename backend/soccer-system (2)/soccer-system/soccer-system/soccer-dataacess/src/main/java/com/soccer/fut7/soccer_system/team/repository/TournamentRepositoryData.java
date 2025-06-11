package com.soccer.fut7.soccer_system.team.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import com.soccer.fut7.soccer_system.team.entitiy.DivisionEntityJpa;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;

public interface TournamentRepositoryData extends JpaRepository<TournamentEntity, UUID> {
    @Procedure(name = "initialize_tournament_roll", procedureName = "fut_jaguar.initialize_tournament_roll")
    void initializeTournamentRoll(
            @Param("p_tournament_name") String tournamentName,
            @Param("p_category_name") String categoryName,
            @Param("p_start_date") LocalDate startDate,
            @Param("p_end_date") LocalDate endDate);

    @Procedure(name = "simulate_round_robin_matches", procedureName = "fut_jaguar.simulate_round_robin_matches")
    void simulateRoundRobinMatches(@Param("p_tournament_id") UUID tournamentId);

    @Procedure(name = "create_tournament_divisions", procedureName = "fut_jaguar.create_tournament_divisions")
    void createTournamentDivisions(@Param("p_tournament_id") UUID tournamentId);

    @Procedure(name = "advance_to_next_phase", procedureName = "fut_jaguar.advance_to_next_phase")
    void advanceToNextPhase(
            @Param("p_tournament_id") UUID tournamentId,
            @Param("p_division_name") String divisionName);

    @Procedure(name = "simulate_elimination_matches", procedureName = "fut_jaguar.simulate_elimination_matches")
    void simulateEliminationMatches(
            @Param("p_tournament_id") UUID tournamentId,
            @Param("p_division_id") UUID divisionId);

    // New procedure for deleting category teams
    @Procedure(name = "delete_category_teams", procedureName = "fut_jaguar.delete_category_teams")
    void deleteCategoryTeams(@Param("p_category_id") UUID categoryId);

    // New procedure for deleting tournament data
    @Procedure(name = "delete_tournament_data", procedureName = "fut_jaguar.delete_tournament_data")
    void deleteTournamentData(@Param("p_tournament_id") UUID tournamentId);

    List<TournamentEntity> findByCategoryId(UUID categoryId);

    // For check_tournament_stage function
    @Query(value = "SELECT * FROM fut_jaguar.check_tournament_stage(:tournamentId, :categoryId)", nativeQuery = true)
    Map<String, Object> checkTournamentStage(
            @Param("tournamentId") UUID tournamentId,
            @Param("categoryId") UUID categoryId);

    // For finding divisions
    @Query("SELECT d FROM DivisionEntityJpa d WHERE d.tournament.id = :tournamentId AND d.divisionName = :divisionName")
    Optional<DivisionEntityJpa> findByTournamentAndDivision(
            @Param("tournamentId") UUID tournamentId,
            @Param("divisionName") String divisionName);

    // For can_advance_division function
    @Query(value = "SELECT * FROM fut_jaguar.can_advance_division(:divisionId, :tournamentId, :categoryId)", nativeQuery = true)
    Map<String, Object> checkDivisionAdvancement(
            @Param("divisionId") UUID divisionId,
            @Param("tournamentId") UUID tournamentId,
            @Param("categoryId") UUID categoryId);
}