package com.soccer.fut7.soccer_system.serviceImpls;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtTeamApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerDebtTeam;

import lombok.AllArgsConstructor;

@Service
@Lazy

@AllArgsConstructor
public class DebtTeamApplicationServiceImpl implements DebtTeamApplicationService {

    private final CommandHandlerDebtTeam  commandHandlerDebtTeam;

    @Override
    public DebtRecordDto insertTeamDebt(DebtRecordDto debt) {
        return commandHandlerDebtTeam.insertTeamDebt(debt);
    }

    @Override
    public Boolean updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return commandHandlerDebtTeam.updateTeamDebtStatus(debtId, status, paidDate);
    }

    @Override
    public Set<DebtRecordDto> getAllTeamDebts(UUID teamId) {
        return commandHandlerDebtTeam.getAllTeamDebts(teamId);
    }

    @Override
    public void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate) {
        commandHandlerDebtTeam.deleteTeamDebtByDate(teamId, dueDate);
    }

    @Override
    public void deleteAllTeamDebts(UUID teamId) {
        commandHandlerDebtTeam.deleteAllTeamDebts(teamId);
    }

    @Override
    public void deleteTeamDebtById(UUID debtId) {
        commandHandlerDebtTeam.deleteTeamDebtById(debtId);
    }
    
    @Override
    public DebtRecordDto updateTeamDebt(UUID debtId, DebtRecordDto debt) {
        return commandHandlerDebtTeam.updateTeamDebt(debtId, debt);
    }
}
