package com.soccer.fut7.soccer_system.team.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ports.outport.TeamDebtRepository;
import com.soccer.fut7.soccer_system.team.entitiy.TeamDebtEntity;
import com.soccer.fut7.soccer_system.team.helpers.TeamDebtCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.TeamDebtMapper;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
@Lazy

@RequiredArgsConstructor
public class DebtTeamAdapter implements TeamDebtRepository {

    private final TeamDebtCommandHelperRepository teamDebtCommandHelperRepository;
    private final TeamDebtMapper teamDebtMapper;
    private final TeamRepositoryData teamRepositoryData;

    @Override
    public Optional<TeamDebt> insertTeamDebt(TeamDebt debt) {
        // First, verify that the team exists
        return teamRepositoryData.findById(debt.getTeamId())
            .map(teamEntity -> {
                TeamDebtEntity teamDebtEntity = teamDebtMapper.toEntity(debt);
                return teamDebtCommandHelperRepository.insertTeamDebt(teamDebtEntity)
                    .map(teamDebtMapper::toDomain);
            })
            .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + debt.getTeamId()));
    }

    @Override
    public Optional<Boolean> updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return teamDebtCommandHelperRepository.updateTeamDebtStatus(debtId, status, paidDate);
    }

    @Override
    public Optional<List<TeamDebt>> getAllTeamDebts(UUID teamId) {
        return teamDebtCommandHelperRepository.getAllTeamDebts(teamId)
            .map(debts -> debts.stream()
                .map(teamDebtMapper::toDomain)
                .collect(Collectors.toList()));
    }

    @Override
    public void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate) {
        teamDebtCommandHelperRepository.deleteTeamDebtByDate(teamId, dueDate);
    }

    @Override
    public void deleteAllTeamDebts(UUID teamId) {
        teamDebtCommandHelperRepository.deleteAllTeamDebts(teamId);
    }


    @Override
    public void deleteTeamDebtById(UUID debtId) {
        teamDebtCommandHelperRepository.deleteTeamDebtById(debtId);
    }
    
    

    @Override
    public Optional<TeamDebt> updateTeamDebt(UUID debtId, TeamDebt debt) {
        return teamRepositoryData.findById(debt.getTeamId())
            .map(teamEntity -> {
                TeamDebtEntity teamDebtEntity = teamDebtMapper.toEntity(debt);
                return teamDebtCommandHelperRepository.updateTeamDebt(debtId, teamDebtEntity)
                    .map(teamDebtMapper::toDomain);
            })
            .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + debt.getTeamId()));
    }
}