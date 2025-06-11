package com.soccer.fut7.soccer_system.team.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepositoryData extends JpaRepository<TeamEntity, UUID> {
    
        @Modifying
        @Transactional
        @Query(value = """
            DELETE FROM fut_jaguar.teams 
            WHERE category_id = :categoryId 
            AND id = :teamId
            """, nativeQuery = true)
        void deleteByCategory_IdAndId(
            @Param("categoryId") UUID categoryId,
            @Param("teamId") UUID teamId);


            @Modifying
            @Transactional
            @Query(value = "DELETE FROM fut_jaguar.teams WHERE category_id = :categoryId", 
                   nativeQuery = true)
            void deleteByCategoryId(@Param("categoryId") UUID categoryId);


    Optional<TeamEntity> findByCategory_IdAndId(UUID categoryId, UUID teamId);
    Optional<TeamEntity> findByTeamNameAndCategory_Id(String teamName, UUID categoryId);
    @Query("SELECT t FROM TeamEntity t WHERE LOWER(t.teamName) LIKE LOWER(concat('%', :teamName,'%'))")
    List<TeamEntity> findByTeamNameContainingIgnoreCase(@Param("teamName") String teamName);


    @Query("SELECT COUNT(t) FROM TeamEntity t WHERE t.category.id = :categoryId")
    int countByCategoryId(@Param("categoryId") UUID categoryId);
}