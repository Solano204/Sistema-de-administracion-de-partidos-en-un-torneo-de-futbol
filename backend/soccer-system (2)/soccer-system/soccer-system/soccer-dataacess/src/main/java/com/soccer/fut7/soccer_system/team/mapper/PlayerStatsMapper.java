package com.soccer.fut7.soccer_system.team.mapper;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.ValueObject.Cards;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.JerseyNumber;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class PlayerStatsMapper implements EntityMapper<Player, PlayerStatsEntity> {

    private final PlayerMapper playerMapper;

    @Override
    public PlayerStatsEntity toEntity(Player domain) {
        if (domain == null) return null;
        
        return PlayerStatsEntity.builder()
            .id(domain.getId())
            .player(playerMapper.toEntity(domain))
            .goals(domain.getGoals().value())
            .points(domain.getPoints().value())
            .jerseyNumber(domain.getJerseyNumber().value())
            .yellowCards(domain.getCards().yellowCards())
            .redCards(domain.getCards().redCards())
            .build();
    }

    @Override
    public Player toDomain(PlayerStatsEntity entity) {
        if (entity == null) return null;
        
        return Player.builder()
            .id(entity.getId())
            .goals(new Goals(entity.getGoals()))
            .points(new Points(entity.getPoints()))
            .jerseyNumber(new JerseyNumber(entity.getJerseyNumber()))
            .cards(new Cards(entity.getYellowCards(), entity.getRedCards()))
            .build();
    }
}