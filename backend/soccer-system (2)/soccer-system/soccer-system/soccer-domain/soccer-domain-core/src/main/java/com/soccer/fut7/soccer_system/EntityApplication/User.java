package com.soccer.fut7.soccer_system.EntityApplication;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.Address;
import com.soccer.fut7.soccer_system.ValueObject.Email;
import com.soccer.fut7.soccer_system.ValueObject.PhoneNumber;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends Person {
    private UUID id;
    private UserCredentials credentials;
    private UserRole role;
    private UserStatus status;
    private String Urlphoto;
    private String email;
    
 
}