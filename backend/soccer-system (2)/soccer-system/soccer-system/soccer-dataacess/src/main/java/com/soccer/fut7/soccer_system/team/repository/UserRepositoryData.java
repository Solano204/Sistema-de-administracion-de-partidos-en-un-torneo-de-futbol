package com.soccer.fut7.soccer_system.team.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;

@Repository
public interface UserRepositoryData extends JpaRepository<UserEntity, UUID> {
    // Corrected methods:
    Optional<UserEntity> findFirstByUserRoleAndId(String userRole, UUID userId);

    List<UserEntity> findByUserRole(String role);

    Optional<UserEntity> findFirstByUserRole(String userRole);

    Optional<UserEntity> findByUsername(String username);

    @Query("SELECT u.username FROM UserEntity u WHERE u.username = :username")
    Optional<String> findUsernameByUsername(@Param("username") String username);
    @Query("SELECT u.email FROM UserEntity u WHERE u.email = :email")
    Optional<String> findEmailByEmail(@Param("email") String email);
    // New method:

    // Corrected delete method:
    void deleteByIdAndUserRole(UUID id, String userRole);

    @Query("SELECT u FROM UserEntity u WHERE u.userRole = :role")
    List<UserEntity> existAdmin(String role);
}