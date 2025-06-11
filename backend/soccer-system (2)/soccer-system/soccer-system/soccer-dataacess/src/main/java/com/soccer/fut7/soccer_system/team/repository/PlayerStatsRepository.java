package com.soccer.fut7.soccer_system.team.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;

@Repository
public interface PlayerStatsRepository extends JpaRepository<PlayerStatsEntity, UUID> {
    @Query("SELECT ps FROM PlayerStatsEntity ps WHERE ps.player.id = :playerId")
    Optional<PlayerStatsEntity> findByPlayerId(@Param("playerId") UUID playerId);
}