package com.soccer.fut7.soccer_system.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.PlayerMatchStatsEntity;

@Repository
public interface PlayerMatchStatsRepositoryData extends JpaRepository<PlayerMatchStatsEntity, UUID> {
    List<PlayerMatchStatsEntity> findByMatch_Id(UUID matchId);
    
    Optional<PlayerMatchStatsEntity> findByMatch_IdAndPlayer_Id(UUID matchId, UUID playerId);
    void deleteByPlayer_IdAndMatch_Id(UUID playerId, UUID matchId);
    void deleteByMatch_Id(UUID matchId);
    void deleteByMatch_IdAndPlayer_Id(UUID matchId, UUID playerId);
    Optional<PlayerMatchStatsEntity> findByPlayer_IdAndMatch_Id(UUID playerId, UUID matchId);
}