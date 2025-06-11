package com.soccer.fut7.soccer_system.team.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity;

import jakarta.transaction.Transactional;

@Repository
public interface PlayerDebtRepositoryData extends JpaRepository<PlayerDebtEntity, UUID> {
    // Custom query methods
    List<PlayerDebtEntity> findByPlayer_Id(UUID playerId);
    
    @Transactional
    void deleteByPlayer_IdAndDueDate(UUID playerId, LocalDate dueDate);

    
    @Transactional
    void deleteByPlayer_Id(UUID playerId);
}
