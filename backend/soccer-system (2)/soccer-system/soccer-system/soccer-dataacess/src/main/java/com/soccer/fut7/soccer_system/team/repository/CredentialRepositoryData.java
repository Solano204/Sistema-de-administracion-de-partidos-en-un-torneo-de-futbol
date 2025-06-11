package com.soccer.fut7.soccer_system.team.repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.expression.spel.ast.OpInc;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;


public interface CredentialRepositoryData extends JpaRepository<CredentialEntity, UUID> {
     @Query("SELECT c FROM CredentialEntity c WHERE LOWER(c.playerName) LIKE LOWER(concat('%', :playerName,'%'))")
    List<CredentialEntity> findByPlayerNameContainingIgnoreCase(@Param("playerName") String playerName);
    List<CredentialEntity> findByPlayerNameContaining(  String playerName);
}