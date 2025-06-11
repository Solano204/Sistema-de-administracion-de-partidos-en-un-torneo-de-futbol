package com.soccer.fut7.soccer_system.team.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Person;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ExceptionApplication.UserException;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.ports.outport.UserRepository;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.helpers.UserCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.UserMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class UserAdapter implements UserRepository {
    private final UserCommandHelperRepository userCommandHelperRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    // private final PasswordEncoder passwordEncoder;

   @Transactional
   @Override
   public Optional<User> insertUser(User userRecord) {
       UserEntity userEntity = userMapper.toEntityWithPassword(userRecord);
       return userCommandHelperRepository.insertUser(userEntity)
           .map(userMapper::toDomainWithPassword);
   }

    @Override
    public Optional<User> updateBasicInformation(UUID userId, User updatedDetails) {
        return userCommandHelperRepository.getUser(userId)
                .map(existingUser -> {
                    // Update first name only if new value is not null/empty
                    if (updatedDetails.getPersonName() != null
                            && updatedDetails.getPersonName().firstName() != null
                            && !updatedDetails.getPersonName().firstName().isEmpty()) {
                        existingUser.setFirstName(updatedDetails.getPersonName().firstName());
                    }

                    // Update last name only if new value is not null/empty
                    if (updatedDetails.getPersonName() != null
                            && updatedDetails.getPersonName().lastName() != null
                            && !updatedDetails.getPersonName().lastName().isEmpty()) {
                        existingUser.setLastName(updatedDetails.getPersonName().lastName());
                    }

                    // Update age only if new value is not null
                    if (updatedDetails.getAge() != null) {
                        existingUser.setAge(updatedDetails.getAge());
                    }

                    if (updatedDetails.getBirthDate() != null) {
                        // Calculate age from birth date if provided
                        existingUser.setBirthDate(updatedDetails.getBirthDate().value());
                    }

                    if (updatedDetails.getEmail() != null) {
                        existingUser.setEmail(updatedDetails.getEmail());
                    }

                    if(updatedDetails.getRole() != null) {
                        existingUser.setUserRole(updatedDetails.getRole().name());
                    }

                    return userCommandHelperRepository.updateUser(existingUser)
                            .map(userMapper::toDomain);
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }

    @Override
    public Optional<User> updatePhotoProfile(UUID userId, String photoUrl) {
        return userCommandHelperRepository.updatePhotoProfile(userId, photoUrl)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<List<User>> getAllUser(UserRole role) {
        List<UserEntity> userEntities = userCommandHelperRepository.getAllUserByRole(role);

        if (userEntities.isEmpty()) {
            return Optional.empty();
        }

        List<User> users = userEntities.stream()
                .map(userMapper::toDomainWithPassword)
                .collect(Collectors.toList());

        return Optional.of(users);
    }

    @Override
    public Optional<User> getUserByRole(UserRole role) {
        return userCommandHelperRepository.getUserByRole(role)
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<Boolean> updateStatus(UUID userId, UserStatus status) {
        return userCommandHelperRepository.updateStatus(userId, status);
    }

    @Override
    public void deleteUser(UUID userId) {
        userCommandHelperRepository.deleteUser(userId);
    }

    @Override
    public Optional<User> loginUser(String username, String password) {
        return userCommandHelperRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .filter(user -> user.getPasswordHash().equals(password))
                .map(userMapper::toDomainWithPassword);
    }


    @Override
    public Optional<Boolean> changeUserPassword(UUID userId, String userName, String currentPassword,
            String newPassword) {
                return userCommandHelperRepository.getUser(userId)
                .filter(user -> passwordEncoder.matches(currentPassword, user.getPasswordHash()))
                .filter(user ->
                {
                     user.getPasswordHash().equals(currentPassword);
                    return true;
                })
                .map(user -> {
                    // String encodedNewPassword = passwordEncoder.encode(newPassword);
                    String encodedNewPassword = newPassword;
                    return userCommandHelperRepository.updatePassword(userId, encodedNewPassword);
                })
                .orElse(Optional.of(false));
    }
  

    @Override
    public Optional<Boolean> changeUsername(UUID userId, String currentUsername, String newUsername,
            String currentPassword) {

        return userCommandHelperRepository.changeUsername(userId, currentUsername, newUsername, currentPassword);
}


    @Override
    public Optional<User> getUserByUsername(String userName) {
        return userCommandHelperRepository.findByUsername(userName)
                .map(userMapper::toDomainWithPassword);
    }

    @Override
    public Boolean existAdmin(UserRole role) {
        return userCommandHelperRepository.existAdmin(role);
    }

    @Override
    public Optional<User> getUserDetails(UUID userId) {
        return userCommandHelperRepository.getUser(userId)
                .map(userMapper::toDomainWithPassword);
    }

    @Override
    public Optional<Boolean> changePasswordWithoutPassword(UUID userId, String userName, String newPassword) {
        return userCommandHelperRepository.getUser(userId)
        .map(user -> {
            // String encodedNewPassword = passwordEncoder.encode(newPassword);
            String encodedNewPassword = newPassword;
            return userCommandHelperRepository.updatePassword(userId, encodedNewPassword);
        })
        .orElse(Optional.of(false));
    }

   
}