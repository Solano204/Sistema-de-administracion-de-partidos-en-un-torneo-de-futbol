package com.soccer.fut7.soccer_system.ports.outport;

import java.lang.foreign.Linker.Option;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;

@Repository
public interface PlayerDebtRepository {
    // Insert a new player debt
    Optional<PlayerDebt> insertPlayerDebt(PlayerDebt debt);

    // Update player debt status and paid date
    Optional<Boolean> updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate);

    // Get all debts for a player
    Optional<List<PlayerDebt>> getAllPlayerDebts(UUID playerId);

    // Delete a specific player debt by date
    void deletePlayerDebtByDate(UUID debtId, LocalDate dueDate);

    // Delete all debts for a player
    void deleteAllPlayerDebts(UUID playerId);


    void deletePlayerDebtById(UUID debtId);
    
    // Update a player debt
    Optional<PlayerDebt> updatePlayerDebt(UUID debtId, PlayerDebt debt);
}