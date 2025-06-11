package com.soccer.fut7.soccer_system.mappers;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Person;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFullWithPassword;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;

import lombok.AllArgsConstructor;

@Component
@Lazy
@AllArgsConstructor
public class UserMapperDomain {
    private final PasswordEncoder passwordEncoder;

    public UserDetailsRecordFull UserToUserDetailsRecordFull(User user) {
        return new UserDetailsRecordFull(user.getId(), user.getPersonName().firstName(),
                user.getPersonName().lastName(),user.getEmail(), user.getBirthDate().value(), user.getRole(), user.getUrlphoto(),
                user.getStatus(),
                user.getAge(), user.getCredentials().username());
    }

    public UserDetailsRecordFullWithPassword UserToUserDetailsRecordFullWithPassword(User user) {
        return new UserDetailsRecordFullWithPassword(user.getId(), user.getPersonName().firstName(),

                user.getPersonName().lastName(), user.getRole(), user.getUrlphoto(), user.getStatus(),
                user.getAge(), user.getCredentials().username(), user.getCredentials().passwordHash());
    }

    public Set<UserDetailsRecordFull> UserToUserDetailsRecordFull(List<User> users) {
        if (users == null) {
            return Set.of(); // Return an empty set if input is null
        }

        return users.stream()
                .map(user -> new UserDetailsRecordFull(
                        user.getId(),
                        user.getPersonName().firstName(),
                        user.getPersonName().lastName(),
                        user.getEmail(),
                        user.getBirthDate().value(),
                        user.getRole(),
                        user.getUrlphoto(),
                        user.getStatus(),
                        user.getAge(),
                        user.getCredentials().username()))
                .collect(Collectors.toSet());
    }

    public User UserRegisterRecordToUser(UserRegisterRecord userRecord) {
        if (userRecord == null) {
            return null;
        }

        return User.builder()
                .id(userRecord.id())
                .credentials(new UserCredentials(userRecord.user(), userRecord.password()))
                .role(UserRole.valueOf(userRecord.role()))
                .email(userRecord.email() != null ? userRecord.email() : "")
                .status(UserStatus.ACTIVO)
                .Urlphoto(userRecord.urlPhoto())
                .birthDate(new BirthDate(userRecord.birthDate()))
                .age(userRecord.age())
                .personName(new PersonName(userRecord.firstName(), userRecord.lastName()))
                .build();
    }


    public User buildUserWithEncodedPassword(UserRegisterRecord record) {
        return User.builder()
            .id(UUID.randomUUID()) // Generate new UUID if not provided
            .Urlphoto(record.urlPhoto())
            .age(record.age())
            .birthDate(new BirthDate(record.birthDate()))
            .credentials(new UserCredentials(
                record.user(), 
                passwordEncoder.encode(record.password()))) // Password encoded here
            .email(record.email())
            .personName(new PersonName(record.firstName(), record.lastName()))
            .role(UserRole.valueOf(record.role()))
            .status(UserStatus.ACTIVO)
            .build();
    }

    public User userUpdateBasicInformationToUser(UserUpdateBasicInformation updatedDetails) {
        if (updatedDetails == null) {
            return null;
        }

        return User.builder()
                .personName(new PersonName(updatedDetails.firstName(), updatedDetails.lastName()))
                .birthDate(new BirthDate(updatedDetails.birthDate()))
                .age(updatedDetails.age())
                .role(UserRole.valueOf(updatedDetails.role()))
                .email(updatedDetails.email() != null ? updatedDetails.email() : "")

                .build();
    }
}
