package com.soccer.fut7.soccer_system.team.mapper;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.Cards;
import com.soccer.fut7.soccer_system.ValueObject.Email;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.JerseyNumber;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.team.dto.projection.PlayerWithTeamAndStatsProjection;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;

// 5. Modify PlayerMapper:
@Component
public class PlayerMapper extends BaseMapper implements EntityMapper<Player, PlayerEntity> {

    @Override
    public PlayerEntity toEntity(Player domain) {
        if (domain == null) {
            return null;
        }

        // Initialize builder
        PlayerEntity.PlayerEntityBuilder builder = PlayerEntity.builder()
                .id(domain.getId())
                .captain(domain.getIsCaptain());

        // Map fields with null checks
        if (domain.getPersonName() != null) {
            builder.firstName(domain.getPersonName().firstName())
                    .lastName(domain.getPersonName().lastName());
        }

        if (domain.getAge() != null) {
            builder.age(domain.getAge());
        }

        if (domain.getJerseyNumber() != null) {
            builder.jerseyNumber(domain.getJerseyNumber().value());
        }

        if (domain.getTeam() != null) {
            builder.team(TeamEntity.builder().id(domain.getTeam().getId()).build());
        }

        if (domain.getPhoto() != null && !domain.getPhoto().isEmpty()) {
            builder.photoUrl(domain.getPhoto());
        }

        if (domain.getBirthDate() != null) {
            builder.birthDate(domain.getBirthDate().value());
        }

        if (domain.getPlayerStatus() == null) {
            builder.playerStatus(PlayerStatus.ACTIVO.toString());
        }

        if (domain.getEmail() != null) {
            builder.email(domain.getEmail().value());
        }

        return builder.build();
    }

    @Override
    public PlayerEntity UUIDtoEntity(UUID playerID) {
        if (playerID == null) {
            return null;
        }
        return PlayerEntity.builder()
                .id(playerID)
                .build();
    }

    @Override
    public Player toDomain(PlayerEntity entity) {
        if (entity == null) {
            return null;
        }

        TeamMapper teamMapper = getMapper(TeamMapper.class);
        Player.PlayerBuilder builder = Player.builder()
                .id(entity.getId())
                .isCaptain(entity.getCaptain());

        // Map fields with null checks
        if (entity.getFirstName() != null && entity.getLastName() != null) {
            builder.personName(new PersonName(entity.getFirstName(), entity.getLastName()));
        }

        if (entity.getAge() != null) {
            builder.age(entity.getAge());
        }

        if (entity.getJerseyNumber() != null) {
            builder.jerseyNumber(new JerseyNumber(entity.getJerseyNumber()));
        }

        if (entity.getTeam() != null) {
            builder.team(teamMapper.toDomain(entity.getTeam()));
        }

        if (entity.getPhotoUrl() != null && !entity.getPhotoUrl().isEmpty()) {
            builder.photo(entity.getPhotoUrl());
        }

        if (entity.getBirthDate() != null) {
            builder.birthDate(new BirthDate(entity.getBirthDate()));
        }

        if (entity.getPlayerStatus() != null && !entity.getPlayerStatus().isEmpty()) {
            builder.playerStatus(PlayerStatus.valueOf(entity.getPlayerStatus()));
        }

        if (entity.getEmail() != null && !entity.getEmail().isEmpty()) {
            builder.email(new Email(entity.getEmail()));
        }

        return builder.build();
    }

    public Set<Player> toDomainWithoutTeam(Set<PlayerEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(entity -> {
                    if (entity == null) {
                        return null;
                    }

                    Player.PlayerBuilder builder = Player.builder()
                            .id(entity.getId())
                            .isCaptain(entity.getCaptain());

                    if (entity.getFirstName() != null && entity.getLastName() != null) {
                        builder.personName(new PersonName(entity.getFirstName(), entity.getLastName()));
                    }

                    if (entity.getJerseyNumber() != null) {
                        builder.jerseyNumber(new JerseyNumber(entity.getJerseyNumber()));
                    }

                    if (entity.getAge() != null) {
                        builder.age(entity.getAge());
                    }

                    if (entity.getPhotoUrl() != null && !entity.getPhotoUrl().isEmpty()) {
                        builder.photo(entity.getPhotoUrl());
                    }

                    if (entity.getBirthDate() != null) {
                        builder.birthDate(new BirthDate(entity.getBirthDate()));
                    }

                    if (entity.getPlayerStatus() != null && !entity.getPlayerStatus().isEmpty()) {
                        builder.playerStatus(PlayerStatus.valueOf(entity.getPlayerStatus()));
                    }

                    if (entity.getEmail() != null && !entity.getEmail().isEmpty()) {
                        builder.email(new Email(entity.getEmail()));
                    }

                    return builder.build();
                })
                .filter(Objects::nonNull) // Filter out any null players
                .collect(Collectors.toSet());
    }

    public PlayerEntity projectionToEntity(PlayerWithTeamAndStatsProjection projection) {
        if (projection == null) {
            return null;
        }
    
        // Create full CategoryEntity
        CategoryEntity category = CategoryEntity.builder()
                .id(projection.getCategoryId())
                .categoryName(projection.getCategoryName())
                .minAge(projection.getCategoryMinAge())
                .maxAge(projection.getCategoryMaxAge())
                .build();
    
        // Create TournamentEntity reference
        TournamentEntity tournament = projection.getTeamTournamentId() != null ? 
                TournamentEntity.builder().id(projection.getTeamTournamentId()).build() : null;
    
        // Create full TeamEntity
        TeamEntity team = TeamEntity.builder()
                .id(projection.getTeamId())
                .teamName(projection.getTeamName())
                .logoUrl(projection.getTeamLogoUrl())
                .category(category)
                .tournament(tournament)
                .numberOfPlayers(projection.getTeamNumberOfPlayers())
                .active(projection.getTeamActive())
                .players(new HashSet<>())
                .build();
    
        // Create PlayerStatsEntity
        PlayerStatsEntity playerStats = PlayerStatsEntity.builder()
                .id(projection.getPlayerStatsId())
                .goals(projection.getPlayerStatsGoals() != null ? projection.getPlayerStatsGoals() : 0)
                .points(projection.getPlayerStatsPoints() != null ? projection.getPlayerStatsPoints() : 0)
                .yellowCards(projection.getPlayerStatsYellowCards() != null ? projection.getPlayerStatsYellowCards() : 0)
                .redCards(projection.getPlayerStatsRedCards() != null ? projection.getPlayerStatsRedCards() : 0)
                .build();
    
        // Create and return PlayerEntity
        PlayerEntity player = PlayerEntity.builder()
                .id(projection.getPlayerId())
                .firstName(projection.getPlayerFirstName())
                .lastName(projection.getPlayerLastName())
                .jerseyNumber(projection.getPlayerJerseyNumber())
                .team(team)
                .age(projection.getPlayerAge())
                .photoUrl(projection.getPlayerPhotoUrl())
                .birthDate(projection.getPlayerBirthDate())
                .email(projection.getPlayerEmail())
                .playerStatus(projection.getPlayerStatus())
                .captain(projection.getPlayerCaptain())
                .playerStats(playerStats)
                .build();
    
        // Set bidirectional relationship
        playerStats.setPlayer(player);
        
        return player;
    }

    public Set<Player> toDomainWithStats(Set<PlayerEntity> entities, Team team) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(entity -> {
                    if (entity == null) {
                        return null;
                    }

                    // Build basic player info
                    Player.PlayerBuilder builder = Player.builder()
                            .id(entity.getId())
                            .isCaptain(entity.getCaptain());
                    builder.team(team);
                    // Map team if it exists

                    // Map basic fields
                    if (entity.getFirstName() != null && entity.getLastName() != null) {
                        builder.personName(new PersonName(entity.getFirstName(), entity.getLastName()));
                    }

                    if (entity.getJerseyNumber() != null) {
                        builder.jerseyNumber(new JerseyNumber(entity.getJerseyNumber()));
                    }

                    if (entity.getAge() != null) {
                        builder.age(entity.getAge());
                    }

                    if (entity.getPhotoUrl() != null && !entity.getPhotoUrl().isEmpty()) {
                        builder.photo(entity.getPhotoUrl());
                    }

                    if (entity.getBirthDate() != null) {
                        builder.birthDate(new BirthDate(entity.getBirthDate()));
                    }

                    if (entity.getPlayerStatus() != null && !entity.getPlayerStatus().isEmpty()) {
                        builder.playerStatus(PlayerStatus.fromString(entity.getPlayerStatus()));
                    }

                    if (entity.getEmail() != null && !entity.getEmail().isEmpty()) {
                        builder.email(new Email(entity.getEmail()));
                    }

                    // Map player stats if they exist
                    if (entity.getPlayerStats() != null) {
                        builder.goals(Goals.of(entity.getPlayerStats().getGoals()));
                        builder.points(Points.of(entity.getPlayerStats().getPoints()));
                        builder.cards(Cards.of(entity.getPlayerStats().getYellowCards(),
                                entity.getPlayerStats().getRedCards()));
                    }

                    return builder.build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    public Set<PlayerEntity> toEntity(Set<Player> domains) {
        if (domains == null) {
            return null;
        }

        return domains.stream()
                .map(this::toEntity)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    public Set<Player> toDomain(Set<PlayerEntity> entities) {
        if (entities == null) {
            return null;
        }

        return entities.stream()
                .map(this::toDomain)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }
}