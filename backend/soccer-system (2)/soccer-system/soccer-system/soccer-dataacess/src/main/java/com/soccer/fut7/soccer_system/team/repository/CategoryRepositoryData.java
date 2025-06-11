package com.soccer.fut7.soccer_system.team.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;

@Repository
public interface CategoryRepositoryData extends JpaRepository<CategoryEntity, UUID> {
    // No additional methods needed as JpaRepository provides standard CRUD operations
}