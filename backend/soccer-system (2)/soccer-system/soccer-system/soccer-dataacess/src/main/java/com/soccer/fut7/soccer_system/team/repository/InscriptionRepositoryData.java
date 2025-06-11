package com.soccer.fut7.soccer_system.team.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;

// JPA Repository Interface
public interface InscriptionRepositoryData extends JpaRepository<InscriptionEntity, UUID> {
    @Query("SELECT i FROM InscriptionEntity i WHERE LOWER(i.nameTeam) LIKE LOWER(concat('%', :nameTeam,'%'))")
    List<InscriptionEntity> findByNameTeamContainingIgnoreCase(@Param("nameTeam") String nameTeam);
    
    List<InscriptionEntity> findByNameTeamContaining(String nameTeam);
    
    List<InscriptionEntity> findTop10ByOrderByDateDesc();
    
    @Query("SELECT i FROM InscriptionEntity i WHERE i.date BETWEEN :startDate AND :endDate")
    List<InscriptionEntity> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM InscriptionEntity i WHERE i.numPlayer = :numPlayers")
    List<InscriptionEntity> findByNumPlayer(@Param("numPlayers") Integer numPlayers);
    
    @Query("SELECT i FROM InscriptionEntity i WHERE i.amount >= :minAmount")
    List<InscriptionEntity> findByAmountGreaterThanEqual(@Param("minAmount") BigDecimal minAmount);
    
    @Query("SELECT COUNT(i) FROM InscriptionEntity i WHERE i.nameTeam = :teamName")
    Long countByTeamName(@Param("teamName") String teamName);
}
