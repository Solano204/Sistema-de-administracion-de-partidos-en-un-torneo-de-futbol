package com.soccer.fut7.soccer_system.team.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.TeamDebtEntity;

import jakarta.transaction.Transactional;

@Repository
public interface TeamDebtRepositoryData extends JpaRepository<TeamDebtEntity, UUID> {
    // Custom query methods
    List<TeamDebtEntity> findByTeam_Id(UUID teamId);
    
    @Transactional
    void deleteByTeam_IdAndDueDate(UUID teamId, LocalDate dueDate);
    
    @Transactional
    void deleteByTeam_Id(UUID teamId);
}