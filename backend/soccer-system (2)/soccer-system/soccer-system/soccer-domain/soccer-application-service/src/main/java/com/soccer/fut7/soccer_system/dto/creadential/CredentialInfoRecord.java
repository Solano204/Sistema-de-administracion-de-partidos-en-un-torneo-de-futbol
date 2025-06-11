package com.soccer.fut7.soccer_system.dto.creadential;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.UUID;

public record CredentialInfoRecord(
    UUID id,
    String playerName,
    // Instant transactionDate,
    BigDecimal amount,
    String description,
    LocalDate createdAt,
    LocalDate updatedAt
) {}