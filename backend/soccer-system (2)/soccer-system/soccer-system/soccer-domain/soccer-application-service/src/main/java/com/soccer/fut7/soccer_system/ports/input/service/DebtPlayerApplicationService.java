package com.soccer.fut7.soccer_system.ports.input.service;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;

public interface DebtPlayerApplicationService {
    DebtRecordDto insertPlayerDebt(DebtRecordDto debt);
    Boolean updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate);
    Set<DebtRecordDto> getAllPlayerDebts(UUID playerId);
    void deletePlayerDebtByDate(UUID playerId, LocalDate dueDate);
    void deleteAllPlayerDebts(UUID playerId);
    void deletePlayerDebtById(UUID debtId);
    DebtRecordDto updatePlayerDebt(UUID debtId, DebtRecordDto debt);
}