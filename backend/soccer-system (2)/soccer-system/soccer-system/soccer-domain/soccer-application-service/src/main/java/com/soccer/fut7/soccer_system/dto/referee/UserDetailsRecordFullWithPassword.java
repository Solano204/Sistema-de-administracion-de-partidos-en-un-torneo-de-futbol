package com.soccer.fut7.soccer_system.dto.referee;

import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

public record UserDetailsRecordFullWithPassword( 
     UUID id,
    String name,
    String lastName,
    UserRole role,
    String profile,
    UserStatus status,
    int age,
    String user,
    String password
    ) {
    
}
