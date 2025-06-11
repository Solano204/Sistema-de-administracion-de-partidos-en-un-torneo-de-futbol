package com.soccer.fut7.soccer_system.team.mapper;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;

@Component
@Lazy

public class UserMapper implements EntityMapper<User, UserEntity> {

    @Override
    public UserEntity toEntity(User domain) {
        if (domain == null)
            return null;

        return UserEntity.builder()
                .id(domain.getId())
                .firstName(domain.getPersonName().firstName())
                .photoUrl(domain.getUrlphoto())
                .lastName(domain.getPersonName().lastName())
                .username(domain.getCredentials().username())
                .userRole(domain.getRole().toString())
                .birthDate(domain.getBirthDate().value())

                .email(domain.getEmail())
                .userStatus(domain.getStatus().toString())
                .build();
    }

    public UserEntity toEntityWithPassword(User domain) {
        if (domain == null)
            return null;

        return UserEntity.builder()
                .id(domain.getId())
                .firstName(domain.getPersonName().firstName())
                .lastName(domain.getPersonName().lastName())
                .photoUrl(domain.getUrlphoto())
                .username(domain.getCredentials().username())
                .birthDate(domain.getBirthDate().value())

                .age(domain.getAge())
                .email(domain.getEmail())
                .passwordHash(domain.getCredentials().passwordHash())
                .userRole(domain.getRole().toString())
                .userStatus(domain.getStatus().toString())
                .build();
    }

    @Override
    public User toDomain(UserEntity entity) {
        if (entity == null)
            return null;

        return User.builder()
                .id(entity.getId())
                .personName(new PersonName(entity.getFirstName(), entity.getLastName()))
                .Urlphoto(entity.getPhotoUrl() != null ? entity.getPhotoUrl() : null)
                .age(entity.getAge())
                .birthDate(BirthDate.of(entity.getBirthDate()))
                .role(UserRole.valueOf(entity.getUserRole())) // Use toString() to convert UserRole
                                                              // entity.getUserRole())
                .status(UserStatus.valueOf(entity.getUserStatus())) // Use toString() to convert UserStatus
                                                                    // entity.getUserStatus())
                .email(entity.getEmail() != null ? entity.getEmail() : null)
                .build();
    }

    public User toDomainWithPassword(UserEntity entity) {
        if (entity == null)
            return null;

        return User.builder()
                .id(entity.getId())
                .personName(new PersonName(entity.getFirstName(), entity.getLastName()))
                .Urlphoto(entity.getPhotoUrl())
                .birthDate(BirthDate.of(entity.getBirthDate()))
                .credentials(new UserCredentials(entity.getUsername(), entity.getPasswordHash()))
                .role(UserRole.valueOf(entity.getUserRole())) // Use toString() to convert UserRole
                                                              // entity.getUserRole())
                .status(UserStatus.valueOf(entity.getUserStatus())) // Use toString() to convert UserStatus
                                                                    // entity.getUserStatus())
                .age(entity.getAge())
                .email(entity.getEmail())
                .build();
    }
}
