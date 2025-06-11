package com.soccer.fut7.soccer_system.EntityApplication;


import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.UUID;

@AllArgsConstructor
@Builder
@Data
public class Credential {
    private UUID id;
    private String playerName;
    // private Instant transactionDate;
    private BigDecimal amount;
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;

}