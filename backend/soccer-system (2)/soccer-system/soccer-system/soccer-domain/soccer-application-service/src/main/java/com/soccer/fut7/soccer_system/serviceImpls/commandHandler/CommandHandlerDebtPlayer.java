package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;


import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperDebtPlayer;

import lombok.AllArgsConstructor;

@Component
@Lazy

@AllArgsConstructor
public class CommandHandlerDebtPlayer {

    private final CommandHelperDebtPlayer commandHelperDebtPlayer;

    public DebtRecordDto insertPlayerDebt(DebtRecordDto debt) {
        return commandHelperDebtPlayer.insertPlayerDebt(debt);
    }

    public Boolean updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return commandHelperDebtPlayer.updatePlayerDebtStatus(debtId, status, paidDate);
    }

    public Set<DebtRecordDto> getAllPlayerDebts(UUID playerId) {
        return commandHelperDebtPlayer.getAllPlayerDebts(playerId);
    }


    public void deletePlayerDebtByDate(UUID playerId, LocalDate dueDate) {
        commandHelperDebtPlayer.deletePlayerDebtByDate(playerId, dueDate);
    }

    public void deleteAllPlayerDebts(UUID playerId) {
        commandHelperDebtPlayer.deleteAllPlayerDebts(playerId);
    }


    public void deletePlayerDebtById(UUID debtId) {
        commandHelperDebtPlayer.deletePlayerDebtById(debtId);
    }
    
    public DebtRecordDto updatePlayerDebt(UUID debtId, DebtRecordDto debt) {
        return commandHelperDebtPlayer.updatePlayerDebt(debtId, debt);
    }
}
