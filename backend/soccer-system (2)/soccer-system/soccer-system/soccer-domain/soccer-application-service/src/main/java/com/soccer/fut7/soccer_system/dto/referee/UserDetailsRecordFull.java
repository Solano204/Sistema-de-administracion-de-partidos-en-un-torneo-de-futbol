package com.soccer.fut7.soccer_system.dto.referee;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

public record UserDetailsRecordFull( 
        UUID id,
        String firstName,
        String lastName,
        String email,
                LocalDate birthDate,
    UserRole role,
        String  urlPhoto,
            UserStatus status,
    int age,
    String user) {
    
}
