package com.soccer.fut7.soccer_system.team.helpers;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity;
import com.soccer.fut7.soccer_system.team.repository.PlayerDebtRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class PlayerDebtCommandHelperRepository {

    private final PlayerDebtRepositoryData playerDebtRepositoryData;

    public Optional<PlayerDebtEntity> insertPlayerDebt(PlayerDebtEntity playerDebtEntity) {
        PlayerDebtEntity savedDebt = playerDebtRepositoryData.save(playerDebtEntity);
        return Optional.of(savedDebt);
    }

    public Optional<Boolean> updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return playerDebtRepositoryData.findById(debtId)
            .map(existingDebt -> {
                existingDebt.setDebtStatus(status.toString());
                existingDebt.setPaidDate(paidDate);
                playerDebtRepositoryData.save(existingDebt);
                return true;
            });
    }

    public Optional<List<PlayerDebtEntity>> getAllPlayerDebts(UUID playerId) {
        List<PlayerDebtEntity> playerDebts = playerDebtRepositoryData.findByPlayer_Id(playerId);
        return Optional.of(playerDebts);
    }

    public void deletePlayerDebtByDate(UUID debtId, LocalDate dueDate) {
        playerDebtRepositoryData.deleteById(debtId);
    }

    public void deleteAllPlayerDebts(UUID playerId) {
        playerDebtRepositoryData.deleteByPlayer_Id(playerId);
    }


    public void deletePlayerDebtById(UUID debtId) {
        playerDebtRepositoryData.deleteById(debtId);
    }
    
    public Optional<PlayerDebtEntity> updatePlayerDebt(UUID debtId, PlayerDebtEntity playerDebtEntity) {
        return playerDebtRepositoryData.findById(debtId)
            .map(existingDebt -> {
                // Preserve the ID
                playerDebtEntity.setId(debtId);
                // Keep the player reference from existing debt
                playerDebtEntity.setPlayer(existingDebt.getPlayer());
                return playerDebtRepositoryData.save(playerDebtEntity);
            });
    }
}