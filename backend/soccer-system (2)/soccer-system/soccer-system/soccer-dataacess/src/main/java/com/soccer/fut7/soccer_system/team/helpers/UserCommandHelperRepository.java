package com.soccer.fut7.soccer_system.team.helpers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ExceptionApplication.RefereeException;
import com.soccer.fut7.soccer_system.ExceptionApplication.UserException;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.repository.UserRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class UserCommandHelperRepository {
    private final UserRepositoryData userRepositoryData;
    
    public Optional<UserEntity> getUser(UUID userId) {
        return userRepositoryData.findById(userId);
    }
    
    public Optional<UserEntity> insertUser(UserEntity userEntity) {
    // Check if username already exists
    if (userRepositoryData.findUsernameByUsername(userEntity.getUsername()).isPresent()) {
        throw new UserException("El nombre de usuario '" + userEntity.getUsername() + "' ya está en uso.");
    }

    // Check if email already exists
    if (userEntity.getEmail() != null && !userEntity.getEmail().isEmpty() && 
        userRepositoryData.findEmailByEmail(userEntity.getEmail()).isPresent()) {
        throw new UserException("El correo electrónico '" + userEntity.getEmail() + "' ya está registrado.");
    }

    try {
        UserEntity savedUser = userRepositoryData.save(userEntity);
        return Optional.of(savedUser);
    } catch (DataIntegrityViolationException e) {
        // Fallback check in case of race condition
        throw new UserException("Error al registrar el usuario. Verifica que el nombre de usuario y correo sean únicos.");
    } 
}
    
    public Optional<UserEntity> updateUser(UserEntity userEntity) {
        return Optional.of(userRepositoryData.save(userEntity));
    }
    
    public Optional<UserEntity> updatePhotoProfile(UUID userId, String photoUrl) {
        return userRepositoryData.findById(userId)
            .map(existingUser -> {
                // Assuming there's a photoUrl field in UserEntity that's not shown in your provided code
                // If there isn't, this method won't be applicable
                // existingUser.setPhotoUrl(photoUrl);
                existingUser.setPhotoUrl(photoUrl);
                return userRepositoryData.save(existingUser);
            });
    }
    
    public List<UserEntity> getAllUserByRole(UserRole role) {
        return userRepositoryData.findByUserRole(role.toString());
    }
    
    public Optional<UserEntity> getUserByRole(UserRole role) {
        return userRepositoryData.findFirstByUserRole(role.toString());
    }
    
    public Optional<Boolean> updateStatus(UUID userId, UserStatus status) {
        return userRepositoryData.findById(userId)
            .map(existingUser -> {
                existingUser.setUserStatus(status.toString());
                userRepositoryData.save(existingUser);
                return true;
            });
    }
    
    public void deleteUser(UUID userId) {
        userRepositoryData.deleteById(userId);
    }
    
    public Optional<String> updateProfilePhoto(UUID userId, String photoUrl) {
        return userRepositoryData.findById(userId)
            .map(existingUser -> {
                // Assuming there's a photoUrl field in UserEntity that's not shown in your provided code
                // If there isn't, this method won't be applicable
                // existingUser.setPhotoUrl(photoUrl);
                userRepositoryData.save(existingUser);
                return photoUrl;
            });
    }
    
    public Optional<UserEntity> findByUsername(String username) {
        return userRepositoryData.findByUsername(username);
    }
    
    public Optional<Boolean> updatePassword(UUID userId, String encodedPassword) {
        return userRepositoryData.findById(userId)
            .map(existingUser -> {
                existingUser.setPasswordHash(encodedPassword);
                userRepositoryData.save(existingUser);
                return true;
            });
    }

    public Boolean existAdmin(UserRole role) {
      if(userRepositoryData.existAdmin(role.toString()).size() > 0) {
        return true;
      } else {
        return false;
      }
    }

    public void deleteUserByIdAndUserRole(UUID id, UserRole userRole) {
        userRepositoryData.deleteByIdAndUserRole(id, userRole.toString());
    }

    public Optional<Boolean> changeUsername(UUID userId, String currentUsername, String newUsername, String currentPassword) {
        // Check if new username exists
        if (userRepositoryData.findUsernameByUsername(newUsername).isPresent()) {
            throw new UserException("El nombre de usuario '" + newUsername + "' fue tomado recientemente. Por favor intenta con otro.");

        }
    
        UserEntity user = userRepositoryData.findById(userId)
            .orElseThrow(() -> new UserException("Usuario no encontrado con ID: " + userId));
    
        // Validate current username matches
        if (!user.getUsername().equals(currentUsername)) {
            throw new UserException("El nombre de usuario actual no coincide.");
        }
    
    
    
        user.setUsername(newUsername);
        userRepositoryData.save(user);
        return Optional.of(true);
    }

    Optional<UserEntity> getByUserName(String username) {
     return userRepositoryData.findByUsername(username);
    }
}