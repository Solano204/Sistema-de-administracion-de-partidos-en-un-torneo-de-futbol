package com.soccer.fut7.soccer_system.team.adapter;
import com.soccer.fut7.soccer_system.team.repository.PlayerDebtRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.PlayerRepositoryData;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ports.outport.PlayerDebtRepository;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity;
import com.soccer.fut7.soccer_system.team.helpers.PlayerDebtCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.PlayerDebtMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Lazy

@RequiredArgsConstructor
public class DebtPlayerAdapter implements PlayerDebtRepository {

    private final PlayerRepositoryData playerRepositoryData_1;



    private final PlayerDebtCommandHelperRepository playerDebtCommandHelperRepository;
    private final PlayerDebtMapper playerDebtMapper;
    private final PlayerRepositoryData playerRepositoryData;

 

    @Override
    public Optional<PlayerDebt> insertPlayerDebt(PlayerDebt debt) {
        // First, verify that the player exists
        return playerRepositoryData.findById(debt.getPlayerId())
            .map(playerEntity -> {
                PlayerDebtEntity playerDebtEntity = playerDebtMapper.toEntity(debt);
                return playerDebtCommandHelperRepository.insertPlayerDebt(playerDebtEntity)
                    .map(playerDebtMapper::toDomain);
            })
            .orElseThrow(() -> new IllegalArgumentException("Player not found with ID: " + debt.getPlayerId()));
    }

    @Override
    public Optional<Boolean> updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return playerDebtCommandHelperRepository.updatePlayerDebtStatus(debtId, status, paidDate);
    }

    @Override
    public Optional<List<PlayerDebt>> getAllPlayerDebts(UUID playerId) {
        return playerDebtCommandHelperRepository.getAllPlayerDebts(playerId)
            .map(debts -> debts.stream()
                .map(playerDebtMapper::toDomain)
                .collect(Collectors.toList()));
    }

    @Override
    public void deletePlayerDebtByDate(UUID debtId, LocalDate dueDate) {
        playerDebtCommandHelperRepository.deletePlayerDebtByDate(debtId, dueDate);
    }

    @Override
    public void deleteAllPlayerDebts(UUID playerId) {
        playerDebtCommandHelperRepository.deleteAllPlayerDebts(playerId);
    }


    @Override
    public void deletePlayerDebtById(UUID debtId) {
        playerDebtCommandHelperRepository.deletePlayerDebtById(debtId);
    }
    
    @Override
    public Optional<PlayerDebt> updatePlayerDebt(UUID debtId, PlayerDebt debt) {
        return playerRepositoryData.findById(debt.getPlayerId())
            .map(playerEntity -> {
                PlayerDebtEntity playerDebtEntity = playerDebtMapper.toEntity(debt);
                return playerDebtCommandHelperRepository.updatePlayerDebt(debtId, playerDebtEntity)
                    .map(playerDebtMapper::toDomain);
            })
            .orElseThrow(() -> new IllegalArgumentException("Player not found with ID: " + debt.getPlayerId()));
    }
}