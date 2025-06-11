package com.soccer.fut7.soccer_system.team.helpers;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.team.entitiy.TeamDebtEntity;
import com.soccer.fut7.soccer_system.team.repository.TeamDebtRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class TeamDebtCommandHelperRepository {

    private final TeamDebtRepositoryData teamDebtRepositoryData;

    public Optional<TeamDebtEntity> insertTeamDebt(TeamDebtEntity  teamDebtEntity) {
        TeamDebtEntity savedDebt = teamDebtRepositoryData.save(teamDebtEntity);
        return Optional.of(savedDebt);
    }

    public Optional<Boolean> updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return teamDebtRepositoryData.findById(debtId)
            .map(existingDebt -> {
                existingDebt.setDebtStatus(status.toString());
                existingDebt.setPaidDate(paidDate);
                teamDebtRepositoryData.save(existingDebt);
                return true;
            });
    }

    public Optional<List<TeamDebtEntity>> getAllTeamDebts(UUID teamId) {
        List<TeamDebtEntity> teamDebts = teamDebtRepositoryData.findByTeam_Id(teamId);
        return Optional.of(teamDebts);
    }

    public void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate) {
        teamDebtRepositoryData.deleteByTeam_IdAndDueDate(teamId, dueDate);
    }

    public void deleteAllTeamDebts(UUID teamId) {
        teamDebtRepositoryData.deleteByTeam_Id(teamId);
    }

    public void deleteTeamDebtById(UUID debtId) {
        teamDebtRepositoryData.deleteById(debtId);
    }
    
    public Optional<TeamDebtEntity> updateTeamDebt(UUID debtId, TeamDebtEntity teamDebtEntity) {
        return teamDebtRepositoryData.findById(debtId)
            .map(existingDebt -> {
                // Preserve the ID
                teamDebtEntity.setId(debtId);
                // Keep the team reference from existing debt
                teamDebtEntity.setTeam(existingDebt.getTeam());
                return teamDebtRepositoryData.save(teamDebtEntity);
            });
    }
}