package com.soccer.fut7.soccer_system.dto.referee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RefereePaymentCreateRecord(
    UUID refereeId,
    LocalDate paymentDate,
    int hoursWorked,
    BigDecimal hourlyRate,
    BigDecimal total
) {}