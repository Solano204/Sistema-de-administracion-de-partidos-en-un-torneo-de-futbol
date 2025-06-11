package com.soccer.fut7.soccer_system.team.mapper;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ValueObject.TeamStatsId;
import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class TeamStatsMapper implements EntityMapper<TeamStats, TeamStatsEntity> {

    private final TeamMapper teamMapper;
    @Override
    public TeamStatsEntity toEntity(TeamStats domain) {
        if (domain == null) return null;
        
        return TeamStatsEntity.builder()
            .id(domain.getId().value())
            .team(teamMapper.UUIDtoEntity(domain.getIdTeam()))
            .matchesPlayed(domain.getMatchesPlayed())
            .goals(domain.getGoalsWin())
            .goalsAgainst(domain.getGoalsAgainst())
            .points(domain.getPoints())
            .build();
    }

    @Override
    public TeamStats toDomain(TeamStatsEntity entity) {
        if (entity == null) return null;
        
        return TeamStats.builder()
            .id(new TeamStatsId(entity.getId()))
            .idTeam(entity.getTeam().getId())
            .logo(entity.getTeam().getLogoUrl() != null ? entity.getTeam().getLogoUrl() : null)
            .nameTeam(entity.getTeam().getTeamName())
            .matchesPlayed(entity.getMatchesPlayed())
            .goalsWin(entity.getGoals())
            .goalsAgainst(entity.getGoalsAgainst())
            .points(entity.getPoints())
            .build();
    }
}