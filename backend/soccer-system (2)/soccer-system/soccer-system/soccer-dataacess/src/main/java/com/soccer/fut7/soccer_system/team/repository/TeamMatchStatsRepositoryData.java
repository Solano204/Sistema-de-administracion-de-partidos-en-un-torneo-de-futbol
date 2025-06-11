package com.soccer.fut7.soccer_system.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.TeamMatchStatsEntity;

@Repository
public interface TeamMatchStatsRepositoryData extends JpaRepository<TeamMatchStatsEntity, UUID > {
    List<TeamMatchStatsEntity> findByMatch_Id(UUID matchId);
    
    Optional<TeamMatchStatsEntity> findByMatch_IdAndTeam_Id(UUID matchId, UUID teamId);
}