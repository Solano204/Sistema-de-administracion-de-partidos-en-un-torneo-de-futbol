package com.soccer.fut7.soccer_system.serviceImpls;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtPlayerApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerDebtPlayer;

import lombok.AllArgsConstructor;

@Service
@Lazy

@AllArgsConstructor
public class DebtPlayerApplicationServiceImpl implements DebtPlayerApplicationService {

    private final CommandHandlerDebtPlayer commandHandlerDebtPlayer;

    @Override
    public DebtRecordDto insertPlayerDebt(DebtRecordDto debt) {
        return commandHandlerDebtPlayer.insertPlayerDebt(debt);
    }

    @Override
    public Boolean updatePlayerDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate) {
        return commandHandlerDebtPlayer.updatePlayerDebtStatus(debtId, status, paidDate);
    }

    @Override
    public Set<DebtRecordDto> getAllPlayerDebts(UUID playerId) {
        return commandHandlerDebtPlayer.getAllPlayerDebts(playerId);
    }

    @Override
    public void deletePlayerDebtByDate(UUID debtId, LocalDate dueDate) {
        commandHandlerDebtPlayer.deletePlayerDebtByDate(debtId, dueDate);
    }

    @Override
    public void deleteAllPlayerDebts(UUID playerId) {
        commandHandlerDebtPlayer.deleteAllPlayerDebts(playerId);
    }

    @Override
    public void deletePlayerDebtById(UUID debtId) {
        commandHandlerDebtPlayer.deletePlayerDebtById(debtId);
    }
    
    @Override
    public DebtRecordDto updatePlayerDebt(UUID debtId, DebtRecordDto debt) {
        return commandHandlerDebtPlayer.updatePlayerDebt(debtId, debt);
    }
}
