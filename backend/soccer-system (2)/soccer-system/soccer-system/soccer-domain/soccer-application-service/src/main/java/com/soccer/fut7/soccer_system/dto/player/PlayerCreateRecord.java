package com.soccer.fut7.soccer_system.dto.player;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.ContactInfoRecord;



public record PlayerCreateRecord(
        UUID playerId,
        String firstName,
        String lastName,
        LocalDate birthDate,
        int jerseyNumber,
        int Age,
        String photo,
        UUID teamId,
        boolean captain,
        String email) {
}
