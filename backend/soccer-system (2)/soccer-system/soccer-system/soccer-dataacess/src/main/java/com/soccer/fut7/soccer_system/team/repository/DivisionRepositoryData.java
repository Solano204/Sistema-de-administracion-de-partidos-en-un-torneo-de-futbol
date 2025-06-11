package com.soccer.fut7.soccer_system.team.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.team.entitiy.DivisionEntityJpa;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DivisionRepositoryData extends JpaRepository<DivisionEntityJpa, UUID> {
    List<DivisionEntityJpa> findByTournamentId(UUID tournamentId);

    @Query(value = "SELECT * FROM fut_jaguar.check_tournament_stage(:tournamentId, :categoryId)", nativeQuery = true)
    Map<String, Object> checkTournamentStage(
            @Param("tournamentId") UUID tournamentId,
            @Param("categoryId") UUID categoryId);

    // Alternative explicit JPQL query
    @Query("SELECT d FROM DivisionEntityJpa d WHERE d.tournament.id = :tournamentId AND d.divisionName = :divisionName")
    public Optional<DivisionEntityJpa> findByTournamentAndDivision(@Param("tournamentId") UUID tournamentId,
            @Param("divisionName") String divisionName);

}