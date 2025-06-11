package com.soccer.fut7.soccer_system.dto.tourment;


import java.time.LocalDate;
import java.util.UUID;

public record TournamentInfoRecord(
    UUID id,
    String tournamentName,
    UUID categoryId,
    String categoryName,
    LocalDate startDate,
    LocalDate endDate,
    String phase
) {}