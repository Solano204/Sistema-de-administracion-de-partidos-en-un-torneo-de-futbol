package com.soccer.fut7.soccer_system.ports.outport;

import java.lang.foreign.Linker.Option;
import java.rmi.server.UID;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.Person;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.user.UserDetailsRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;

@Repository
public interface UserRepository {
    Optional<User> insertUser(User refereeRecord);

    public Optional<User> updateBasicInformation(UUID refereeId, User updatedDetails);

    public Optional<User> updatePhotoProfile(UUID refereeId, String photoUrl);

    Optional<List<User>> getAllUser(UserRole role);
    Optional<User> getUserByRole(UserRole role);

    Optional<Boolean> updateStatus(UUID refereeId, UserStatus status);


    void deleteUser(UUID userId);

    // Update profile photo

    // User login
    Optional<User> loginUser(String username, String password);

    // Change user password
    Optional<Boolean> changeUserPassword(UUID userId, String userName, String currentPassword, String newPassword);
    Optional<Boolean> changePasswordWithoutPassword(UUID userId, String userName,String newPassword);

    Optional <Boolean> changeUsername(UUID userId, String currentUsername, String newUsername, String currentPassword);


    Optional<User> getUserByUsername(String userName);

    Boolean existAdmin(UserRole role);

    Optional<User> getUserDetails(UUID userId);
}
