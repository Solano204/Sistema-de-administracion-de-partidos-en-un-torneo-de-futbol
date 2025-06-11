package com.soccer.fut7.soccer_system.EntityApplication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

// Domain Entity
@AllArgsConstructor
@Builder
@Data
public class Inscription {
    private UUID id;
    private String nameTeam;
    private Integer numPlayer;
    private LocalDate date;
    private BigDecimal amount;
    // private LocalDate createdAt;
    // private LocalDate updatedAt;
}