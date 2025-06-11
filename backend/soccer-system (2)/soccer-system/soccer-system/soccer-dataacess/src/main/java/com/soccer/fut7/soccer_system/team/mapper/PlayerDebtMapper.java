package com.soccer.fut7.soccer_system.team.mapper;

import java.util.Currency;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class PlayerDebtMapper implements EntityMapper<PlayerDebt, PlayerDebtEntity> {

    private final PlayerMapper playerMapper;

    @Override
    public PlayerDebtEntity toEntity(PlayerDebt domain) {
        if (domain == null) return null;
        
        return PlayerDebtEntity.builder()
            .id(domain.getId())
            .player(playerMapper.UUIDtoEntity(domain.getPlayerId()))
            .debtStatus(domain.getStatus().toString())
            .amount(domain.getAmount().amount())
            .currency(domain.getAmount().currency().getCurrencyCode())
            .description(domain.getDescription())
            .dueDate(domain.getDueDate().value())
            .paidDate(domain.getPaidDate() != null ? domain.getPaidDate().value() : null)
            .build();
    }

    @Override
    public PlayerDebt toDomain(PlayerDebtEntity entity) {
        if (entity == null) return null;
        
        return PlayerDebt.builder()
            .id(entity.getId())
            .playerId(entity.getPlayer().getId())
            .name(entity.getPlayer().getFirstName() + " " + entity.getPlayer().getLastName())
            .status(DebtStatus.valueOf(entity.getDebtStatus()))
            .amount(new Money(entity.getAmount(), Currency.getInstance(entity.getCurrency())))
            .description(entity.getDescription())
            .dueDate(new DebtDate(entity.getDueDate()))
            .paidDate(entity.getPaidDate() != null ? new DebtDate(entity.getPaidDate()) : null)
            .build();
    }
}