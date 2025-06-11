package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;


import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperDebtTeam;

import lombok.AllArgsConstructor;

@Component
@Lazy

@AllArgsConstructor
public class CommandHandlerDebtTeam {

    private final CommandHelperDebtTeam commandHelperDebtTeam;

    public DebtRecordDto insertTeamDebt(DebtRecordDto debt) {
        return commandHelperDebtTeam.insertTeamDebt(debt);
    }

    public Boolean updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return commandHelperDebtTeam.updateTeamDebtStatus(debtId, status, paidDate);
    }

    public Set<DebtRecordDto> getAllTeamDebts(UUID teamId) {
        return commandHelperDebtTeam.getAllTeamDebts(teamId);
    }

    public void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate) {
        commandHelperDebtTeam.deleteTeamDebtByDate(teamId, dueDate);
    }

    public void deleteAllTeamDebts(UUID teamId) {
        commandHelperDebtTeam.deleteAllTeamDebts(teamId);
    }

    public void deleteTeamDebtById(UUID debtId) {
        commandHelperDebtTeam.deleteTeamDebtById(debtId);
    }
    
    public DebtRecordDto updateTeamDebt(UUID debtId, DebtRecordDto debt) {
        return commandHelperDebtTeam.updateTeamDebt(debtId, debt);
    }
}
