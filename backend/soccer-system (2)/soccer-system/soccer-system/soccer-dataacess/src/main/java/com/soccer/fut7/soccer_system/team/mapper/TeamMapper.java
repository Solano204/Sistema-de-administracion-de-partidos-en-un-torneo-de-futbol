package com.soccer.fut7.soccer_system.team.mapper;

import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ValueObject.TeamLogo;
import com.soccer.fut7.soccer_system.ValueObject.TeamName;
import com.soccer.fut7.soccer_system.ValueObject.TeamStatsId;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

// 4. Modify TeamMapper to use the BaseMapper:
@Component
@AllArgsConstructor
public class TeamMapper extends BaseMapper implements EntityMapper<Team, TeamEntity> {

    private final PlayerMapper playerMapper;
    @Override
    public TeamEntity toEntity(Team domain) {
        if (domain == null) {
            return null;
        }
    
        CategoryMapper categoryMapper = getMapper(CategoryMapper.class);
    
        return TeamEntity.builder()
                .id(domain.getId())  // will be null if domain.getId() is null
                .teamName(domain.getName() != null ? domain.getName().value() : null)
                .logoUrl(domain.getLogo() != null ? domain.getLogo().url() : null)
                .category(domain.getCategory() != null ? categoryMapper.toEntity(domain.getCategory()) : null)
                .active(domain.getActive() != null ? domain.getActive() : false)
                // .players(domain.getPlayers() != null ? playerMapper.toEntity(domain.getPlayers()) : null)
                .numberOfPlayers(domain.getNumberOfPlayers())  // will be null if domain.getNumberOfPlayers() is null
                .build();
    }

    public TeamEntity toEntityWithPlayers(Team domain) {
        if (domain == null)
            return null;

        CategoryMapper categoryMapper = getMapper(CategoryMapper.class);

        return TeamEntity.builder()
                .id(domain.getId())
                .teamName(domain.getName().value())
                .logoUrl(domain.getLogo().url())
                .category(categoryMapper.toEntity(domain.getCategory()))
                .numberOfPlayers(domain.getNumberOfPlayers())
                .players(playerMapper.toEntity(domain.getPlayers()))
                .build();
    }


    @Override
    public TeamEntity UUIDtoEntity(UUID idTeam) {
        return TeamEntity.builder()
                .id(idTeam)
                .build();
    }

    @Override
    public Team toDomain(TeamEntity entity) {
        if (entity == null)
            return null;

        CategoryMapper categoryMapper = getMapper(CategoryMapper.class);
        PlayerMapper playerMapper = getMapper(PlayerMapper.class);

        TeamStatsEntity teamStats = entity.getTeamStats();
        // First create a team with basic info (without players)
        Team.TeamBuilder teamBuilder = Team.builder()
                .id(entity.getId())
                .name(new TeamName(entity.getTeamName()))
                .logo(new TeamLogo(entity.getLogoUrl()))
                .active(entity.getActive())
                .stats(teamStats != null ? toTeamStats(teamStats) : null)
                .category(categoryMapper.toDomain(entity.getCategory()))
                .numberOfPlayers(entity.getNumberOfPlayers());
        
        // Map players with a reference to the team (without full team details)
        if (entity.getPlayers() != null && !entity.getPlayers().isEmpty()) {
            // Create a lightweight team reference for players
            Team teamReference = Team.builder()
                    .id(entity.getId())
                    .name(new TeamName(entity.getTeamName()))
                    .build();

            teamBuilder.players(playerMapper.toDomainWithStats(entity.getPlayers(), teamReference));
        }

        return teamBuilder.build();
    }

    public TeamStats toTeamStats(TeamStatsEntity entity) {
        if (entity == null) {
            return null;
        }

        return TeamStats.builder()
                .id(new TeamStatsId(entity.getId())) // Assuming TeamStatsId wraps UUID
                .idTeam(entity.getTeam() != null ? entity.getTeam().getId() : null)
                .nameTeam(entity.getTeam() != null ? entity.getTeam().getTeamName() : null)
                .matchesPlayed(entity.getMatchesPlayed() != null ? entity.getMatchesPlayed() : 0)
                .goalsWin(entity.getGoals() != null ? entity.getGoals() : 0)
                .goalsAgainst(entity.getGoalsAgainst() != null ? entity.getGoalsAgainst() : 0)
                .points(entity.getPoints() != null ? entity.getPoints() : 0)
                .qualified(entity.getQualifiedNextRound() != null ? entity.getQualifiedNextRound() : false)
                .matchesWon(entity.getMatchesWon() != null ? entity.getMatchesWon() : 0)
                .matchesDrawn(entity.getMatchesDrawn() != null ? entity.getMatchesDrawn() : 0)
                .matchesLost(entity.getMatchesLost() != null ? entity.getMatchesLost() : 0)
                .build();
    }
}
