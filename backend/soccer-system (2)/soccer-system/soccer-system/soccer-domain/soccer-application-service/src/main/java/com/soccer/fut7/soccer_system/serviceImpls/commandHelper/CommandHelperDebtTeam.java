package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ExceptionApplication.DebtException;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.mappers.DebtMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.TeamDebtRepository;

import lombok.AllArgsConstructor;

@Component
@Lazy

@AllArgsConstructor
public class CommandHelperDebtTeam {

    private final TeamDebtRepository teamDebtRepository;
    private final DebtMapperDomain debtMapper;

    // Insert a new team debt
    public DebtRecordDto insertTeamDebt(DebtRecordDto debt) {
        return debtMapper.teamDebtToTeamDebtDetailsRecord(
                teamDebtRepository.insertTeamDebt(debtMapper.debtRecordDtoToTeamDebt(debt))
                        .orElseThrow(() -> new DebtException("Failed to insert team debt")));
    }

    // Update team debt status and paid date
    public Boolean updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return teamDebtRepository.updateTeamDebtStatus(debtId, status, paidDate)
                .orElseThrow(() -> new DebtException("Failed to update team debt"));
    }

    // Get all debts for a team
    public Set<DebtRecordDto> getAllTeamDebts(UUID teamId) {
        return debtMapper.teamDebtsToTeamDebtDetailsRecords(
                teamDebtRepository.getAllTeamDebts(teamId)
                        .orElseThrow(() -> new DebtException("Failed to get team debts")));
    }

    // Delete a specific team debt by date
    public void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate) {
        teamDebtRepository.deleteTeamDebtByDate(teamId, dueDate);
    }

    // Delete all debts for a team
    public void deleteAllTeamDebts(UUID teamId) {
        teamDebtRepository.deleteAllTeamDebts(teamId);
    }

    public void deleteTeamDebtById(UUID debtId) {
        teamDebtRepository.deleteTeamDebtById(debtId);
    }

    public DebtRecordDto updateTeamDebt(UUID debtId, DebtRecordDto debt) {
        return debtMapper.teamDebtToTeamDebtDetailsRecord(
                teamDebtRepository.updateTeamDebt(debtId, debtMapper.debtRecordDtoToTeamDebt(debt))
                        .orElseThrow(() -> new DebtException("Failed to update team debt")));
    }
}
