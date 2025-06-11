package com.soccer.fut7.soccer_system.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;

@Repository
public interface PlayerStatsRepositoryData extends JpaRepository<PlayerStatsEntity, UUID> {

    @Modifying
    @Query("DELETE FROM PlayerStatsEntity ps WHERE ps.player.team.id = :teamId")
    void deleteByTeamId(@Param("teamId") UUID teamId);

    @Query("SELECT ps FROM PlayerStatsEntity ps JOIN ps.player p JOIN p.team t JOIN t.category c WHERE c.id = :categoryId ORDER BY ps.points DESC")
    List<PlayerStatsEntity> findByCategoryIdOrderByPointsDesc(@Param("categoryId") UUID categoryId);

    @Query("SELECT ps FROM PlayerStatsEntity ps WHERE ps.player.id = :playerId")
    Optional<PlayerStatsEntity> findByPlayerId(@Param("playerId") UUID playerId);

    

}
// Additional custom query methods can be added here if needed
