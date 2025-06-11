package com.soccer.fut7.soccer_system.dto.utility;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;

public record UpdateDebt(
    UUID playerId,
    BigDecimal amount,
    LocalDate paidDate,
    DebtStatus state
) {}