package com.soccer.fut7.soccer_system.dto.user;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;

public record UserRegisterRecord(
UUID id,
    String firstName,
    String lastName,
    String email,
    LocalDate birthDate,
    int age,
    String user,
    String password,
    String role,
    String urlPhoto
    
) {}
// public record UserRegisterRecord(
// UUID id,
//     String firstName,
//     String lastName,
//     LocalDate birthDate,
//     int age,
//     String user,
//     String password,
//     UserRole role,
//     String urlPhoto
    
// ) {}