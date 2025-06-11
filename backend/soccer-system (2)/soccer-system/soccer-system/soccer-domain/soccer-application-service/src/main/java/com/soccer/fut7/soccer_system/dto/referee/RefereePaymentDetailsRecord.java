package com.soccer.fut7.soccer_system.dto.referee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RefereePaymentDetailsRecord(
    UUID id,
    UserRefereeSummaryRecord referee,
    LocalDate paymentDate,
    double hoursWorked,
    BigDecimal hourlyRate,
    BigDecimal totalAmount,
    UUID matchId
) {}