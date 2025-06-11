package com.soccer.fut7.soccer_system.team.helpers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;

@Repository
public interface RefereeRepositoryData extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByIdAndUserRole(UUID id, UserRole userRole);
    List<UserEntity> findAllByUserRole(UserRole userRole);
    boolean existsByUsername(String username);
    Optional<UserEntity> findByUsernameAndUserRole(String username, UserRole userRole);
}