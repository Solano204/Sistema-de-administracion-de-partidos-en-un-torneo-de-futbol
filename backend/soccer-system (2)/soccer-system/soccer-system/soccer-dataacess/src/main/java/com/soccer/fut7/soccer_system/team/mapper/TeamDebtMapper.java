package com.soccer.fut7.soccer_system.team.mapper;

import java.util.Currency;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.team.entitiy.TeamDebtEntity;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class TeamDebtMapper implements EntityMapper<TeamDebt, TeamDebtEntity> {

    private final TeamMapper teamMapper;

    @Override
    public TeamDebtEntity toEntity(TeamDebt domain) {
        if (domain == null) return null;
        
        return TeamDebtEntity.builder()
            .id(domain.getId())
            .team(teamMapper.UUIDtoEntity(domain.getTeamId()))
            .debtStatus(domain.getStatus().toString())
            .amount(domain.getAmount().amount())
            .currency(domain.getAmount().currency().getCurrencyCode())
            .description(domain.getDescription())
            .dueDate(domain.getDueDate().value())
            .paidDate(domain.getPaidDate() != null ? domain.getPaidDate().value() : null)
            .build();
    }

    @Override
    public TeamDebt toDomain(TeamDebtEntity entity) {
        if (entity == null) return null;
        
        return TeamDebt.builder()
            .id(entity.getId())
            .teamId(entity.getTeam().getId())
            .name(entity.getTeam().getTeamName())
            .status(DebtStatus.valueOf(entity.getDebtStatus()))
            .amount(new Money(entity.getAmount(), Currency.getInstance(entity.getCurrency())))
            .description(entity.getDescription())
            .dueDate(new DebtDate(entity.getDueDate()))
            .paidDate(entity.getPaidDate() != null ? new DebtDate(entity.getPaidDate()) : null)
            .build();
    }
}