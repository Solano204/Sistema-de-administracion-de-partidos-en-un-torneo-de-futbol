package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Debt;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ExceptionApplication.DebtException;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.mappers.DebtMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.PlayerDebtRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamDebtRepository;

import lombok.AllArgsConstructor;

@Component
@Lazy
@AllArgsConstructor
public class CommandHelperDebtPlayer {

  private final TeamDebtRepository teamDebtRepository;
  private final PlayerDebtRepository playerDebtRepository;
  private final DebtMapperDomain debtMapper;

  public DebtRecordDto insertPlayerDebt(DebtRecordDto debt) {
    return debtMapper.playerDebtToPlayerDebtDetailsRecord(
        playerDebtRepository.insertPlayerDebt(debtMapper.debtRecordDtoToPlayerDebt(debt))
            .orElseThrow(() -> new DebtException("Failed to insert player debt")));
  }

  // Update player debt status and paid date
  public Boolean updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
    return playerDebtRepository.updatePlayerDebtStatus(debtId, status, paidDate)
        .orElseThrow(() -> new DebtException("Failed to update player debt"));
  }

  // Get all debts for a player
  public Set<DebtRecordDto> getAllPlayerDebts(UUID playerId) {
    return debtMapper.playerDebtsToPlayerDebtDetailsRecords(playerDebtRepository.getAllPlayerDebts(playerId)
        .orElseThrow(() -> new DebtException("Failed to get player debts")));
  }

  // Delete a specific player debt by date
  public void deletePlayerDebtByDate(UUID debtId, LocalDate dueDate) {
    playerDebtRepository.deletePlayerDebtByDate(debtId, dueDate);
  }

  // Delete all debts for a player
  public void deleteAllPlayerDebts(UUID playerId) {
    playerDebtRepository.deleteAllPlayerDebts(playerId);
  }

  public void deletePlayerDebtById(UUID debtId) {
    playerDebtRepository.deletePlayerDebtById(debtId);
  }

  public DebtRecordDto updatePlayerDebt(UUID debtId, DebtRecordDto debt) {
    return debtMapper.playerDebtToPlayerDebtDetailsRecord(
        playerDebtRepository.updatePlayerDebt(debtId, debtMapper.debtRecordDtoToPlayerDebt(debt))
            .orElseThrow(() -> new DebtException("Failed to update player debt")));
  }
}
