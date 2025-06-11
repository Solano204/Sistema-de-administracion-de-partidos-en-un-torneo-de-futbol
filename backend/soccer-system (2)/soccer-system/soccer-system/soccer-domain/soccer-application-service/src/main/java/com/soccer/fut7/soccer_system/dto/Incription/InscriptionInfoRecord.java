package com.soccer.fut7.soccer_system.dto.Incription;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

// DTO (Client Layer)
public record InscriptionInfoRecord(
    UUID id,
    String nameTeam,
    Integer numPlayer,
    LocalDate date,
    BigDecimal amount
    // LocalDate createdAt,
    // LocalDate updatedAt
) {}