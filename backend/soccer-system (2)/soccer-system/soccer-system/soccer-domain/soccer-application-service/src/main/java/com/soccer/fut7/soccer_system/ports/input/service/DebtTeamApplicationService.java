package com.soccer.fut7.soccer_system.ports.input.service;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;

public interface DebtTeamApplicationService {
    DebtRecordDto insertTeamDebt(DebtRecordDto debt);
    Boolean updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate);
    Set<DebtRecordDto> getAllTeamDebts(UUID teamId);
    void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate);
    void deleteAllTeamDebts(UUID teamId);
    void deleteTeamDebtById(UUID debtId);
    DebtRecordDto updateTeamDebt(UUID debtId, DebtRecordDto debt);
}
