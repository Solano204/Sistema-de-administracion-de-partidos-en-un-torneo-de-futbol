package com.soccer.fut7.soccer_system.mappers;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Debt;
import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;

@Component
@Lazy
public class DebtMapperDomain {
    public DebtRecordDto playerDebtToPlayerDebtDetailsRecord(PlayerDebt playerDebt) {
        if (playerDebt == null)
            return null;

        return new DebtRecordDto(
                playerDebt.getId(),
                playerDebt.getPlayerId(),
                playerDebt.getName(),
                playerDebt.getAmount().amount(),
                playerDebt.getDescription(),
                playerDebt.getDueDate().value(),
                playerDebt.getPaidDate() != null ? playerDebt.getPaidDate().value() : null,
                playerDebt.getStatus());
    }

    public DebtRecordDto teamDebtToTeamDebtDetailsRecord(TeamDebt teamDebt) {
        if (teamDebt == null)
            return null;

        return new DebtRecordDto(
                teamDebt.getId(),
                teamDebt.getTeamId(),
                teamDebt.getName(),
                teamDebt.getAmount().amount(),
                teamDebt.getDescription(),
                teamDebt.getDueDate().value(),
                teamDebt.getPaidDate() != null ? teamDebt.getPaidDate().value() : null,
                teamDebt.getStatus());
    }

    public Set<DebtRecordDto> playerDebtsToPlayerDebtDetailsRecords(List<PlayerDebt> playerDebts) {
        if (playerDebts == null || playerDebts.isEmpty()) {
            return Collections.emptySet();
        }

        return playerDebts.stream()
                .filter(Objects::nonNull)
                .map(this::playerDebtToPlayerDebtDetailsRecord)
                .collect(Collectors.toSet());
    }

    public Set<DebtRecordDto> teamDebtsToTeamDebtDetailsRecords(List<TeamDebt> teamDebts) {
        if (teamDebts == null || teamDebts.isEmpty()) {
            return Collections.emptySet();
        }

        return teamDebts.stream()
                .filter(Objects::nonNull)
                .map(this::teamDebtToTeamDebtDetailsRecord)
                .collect(Collectors.toSet());
    }

    public PlayerDebt debtRecordDtoToPlayerDebt(DebtRecordDto dto) {

        return PlayerDebt.builder()
                .id(dto.Id())
                .amount(new Money(dto.amount(), null))
                .description(dto.description())
                .dueDate(new DebtDate(dto.dueDate()))
                .paidDate(dto.paidDate() != null ? new DebtDate(dto.paidDate()) : null)
                .status(dto.state())
                .playerId(dto.IdProperty()) // Assigning the player
                .name(dto.nameProperty()) // Assigning the player
                .build();
    }

    public TeamDebt debtRecordDtoToTeamDebt(DebtRecordDto dto) {

        return TeamDebt.builder()
                .id(dto.Id())
                .amount(new Money(dto.amount(), null))
                .description(dto.description())
                .dueDate(new DebtDate(dto.dueDate()))
                .paidDate(dto.paidDate() != null ? new DebtDate(dto.paidDate()) : null)
                .status(dto.state())
                .name(dto.nameProperty())
                .teamId(dto.IdProperty()) // Assigning the team
                .build();
    }

}
