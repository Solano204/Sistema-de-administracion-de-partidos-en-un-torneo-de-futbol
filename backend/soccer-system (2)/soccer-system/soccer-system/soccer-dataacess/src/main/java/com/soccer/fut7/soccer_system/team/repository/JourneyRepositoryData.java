package com.soccer.fut7.soccer_system.team.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soccer.fut7.soccer_system.team.entitiy.JourneyEntity;

public interface JourneyRepositoryData extends JpaRepository<JourneyEntity, UUID> {
    
}
