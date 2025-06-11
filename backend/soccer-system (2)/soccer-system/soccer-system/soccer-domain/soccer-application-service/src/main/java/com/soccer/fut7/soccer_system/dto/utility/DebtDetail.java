package com.soccer.fut7.soccer_system.dto.utility;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;

public record DebtDetail(
    UUID id,
    PlayerSummaryRecord player,
    BigDecimal amount,
    DebtStatus status,
    String description,
    LocalDate createdDate,
    LocalDate dueDate,
    LocalDate paidDate
) {}