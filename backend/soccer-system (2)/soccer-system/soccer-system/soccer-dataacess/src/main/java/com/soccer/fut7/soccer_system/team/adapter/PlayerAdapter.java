package com.soccer.fut7.soccer_system.team.adapter;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.dto.common.PlayerDetailsDTO;
import com.soccer.fut7.soccer_system.dto.common.PlayerStatsDTO;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.ports.outport.PlayerRepository;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.helpers.PlayerCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.PlayerMapper;
import com.soccer.fut7.soccer_system.team.mapper.PlayerStatsMapper;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Lazy
@Slf4j
@RequiredArgsConstructor
public class PlayerAdapter implements PlayerRepository {
    private final PlayerCommandHelperRepository playerCommandHelperRepository;
    private final PlayerMapper playerMapper;
    private final TeamRepositoryData teamRepositoryData;
    private final PlayerStatsMapper playerStatsMapper;

    @Override
    public Set<PlayerStatsDTO> getPlayersOrganizedByPoints(UUID categoryId) {
        return playerCommandHelperRepository.getPlayersOrganizedByPoints(categoryId)
                .stream()
                .collect(Collectors.toSet());
    }

    @Override
    public Optional<Player> registerPlayerWithBasicInfo(Player player) {

        return teamRepositoryData.findById(player.getTeam().getId())
                .map(teamEntity -> {
                    PlayerEntity playerEntity = playerMapper.toEntity(player);
                    playerEntity.setTeam(teamEntity);
                    return playerCommandHelperRepository.registerPlayerWithBasicInfo(playerEntity)
                            .map(playerMapper::toDomain);
                })
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + player.getTeam().getId()));
    }

    @Override
    public Optional<Boolean> registerBatchPlayerWithBasicInfo(Set<Player> players) {
        // Validate that all players belong to existing teams
        Set<UUID> teamIds = players.stream()
                .map(player -> player.getTeam().getId())
                .collect(Collectors.toSet());

        List<TeamEntity> existingTeams = teamRepositoryData.findAllById(teamIds);

        if (existingTeams.size() != teamIds.size()) {
            throw new IllegalArgumentException("One or more teams do not exist");
        }

        Set<PlayerEntity> playerEntities = players.stream()
                .map(playerMapper::toEntity)
                .collect(Collectors.toSet());
        playerEntities.forEach(playerEntity -> {
            TeamEntity teamEntity = existingTeams.stream()
                    .filter(team -> team.getId().equals(playerEntity.getTeam().getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + playerEntity.getTeam().getId()));
            playerEntity.setTeam(teamEntity);
        });
        return playerCommandHelperRepository.registerBatchPlayerWithBasicInfo(playerEntities);
    }

    public Optional<Boolean> registerBatchPlayersWithBasicInfoWithoutTeam(Set<Player> players) {
        // Validate that all players belong to existing teams
        Set<UUID> teamIds = players.stream()
                .map(player -> player.getTeam().getId())
                .collect(Collectors.toSet());

        List<TeamEntity> existingTeams = teamRepositoryData.findAllById(teamIds);

        if (existingTeams.size() != teamIds.size()) {
            throw new IllegalArgumentException("One or more teams do not exist");
        }

        Set<PlayerEntity> playerEntities = players.stream()
                .map(playerMapper::toEntity)
                .collect(Collectors.toSet());

        
        playerCommandHelperRepository.createAllPlayerBasicWithoutTeam(playerEntities);
        return Optional.of(true);
    }

    @Override
    public Optional<Player> updatePlayerBasicInfo(Player player) {
        PlayerEntity playerEntity = playerMapper.toEntity(player);
        return playerCommandHelperRepository.updatePlayerBasicInfo(playerEntity)
                .map(playerMapper::toDomain);
    }

    @Override
    public Optional<Boolean> updatePhotoIdUser(UUID playerId, String photoId) {
        return playerCommandHelperRepository.updatePhotoIdUser(playerId, photoId);
    }

    @Override
    public Optional<PlayerDetailsDTO> getPlayerFullDetails(UUID playerId) {
        return playerCommandHelperRepository.getPlayerFullDetails(playerId);
    }

    @Override
    public Optional<Player> updatePlayerPositionStats(UUID playerId, GoalsRecord goalsRecord, PointsRecord pointsRecord,
            CardsRecord card) {

        log.info("playerId: {}", playerId, "goalsRecord: {}", goalsRecord, "pointsRecord: {}", pointsRecord, "card: {}",
                card);

        log.info("Updating stats for player {}: Goals +{}, Points +{}, Red Cards +{}, Yellow Cards +{}", playerId,
                goalsRecord.value(), pointsRecord.value(), card.redCards(), card.yellowCards());

        return playerCommandHelperRepository.updatePlayerPositionStats(
                playerId,
                goalsRecord.value(),
                pointsRecord.value(),
                card).map(playerMapper::toDomain);
    }

    @Override
    public void deleteAllPlayersFromTeam(UUID teamId) {
        playerCommandHelperRepository.deleteAllPlayersFromTeam(teamId);
    }

    @Override
    public void removePlayerFromTeam(UUID playerId) {
        playerCommandHelperRepository.removePlayerFromTeam(playerId);
    }

    @Override
    public Optional<Boolean> updateBatchPlayerInformation(Set<Player> players) {
        // Validate that all players belong to existing teams
        Set<UUID> teamIds = players.stream()
                .map(player -> player.getTeam().getId())
                .collect(Collectors.toSet());

        List<TeamEntity> existingTeams = teamRepositoryData.findAllById(teamIds);

        if (existingTeams.size() != teamIds.size()) {
            throw new IllegalArgumentException("One or more teams do not exist");
        }

        Set<PlayerEntity> playerEntities = players.stream()
                .map(playerMapper::toEntity)
                .collect(Collectors.toSet());

        return playerCommandHelperRepository.updateBatchPlayerWithBasicInfo(playerEntities);
    }

    @Override
    public void removePlayersFromTeam(UUID teamId, List<UUID> playerIds) {
        playerCommandHelperRepository.removePlayersFromTeam(teamId, playerIds);
    }

    @Override
    public List<Player> getPlayersByName(String playerName) {
        return playerCommandHelperRepository.getPlayersByName(playerName).stream()
                .map(playerMapper::toDomain)
                .collect(Collectors.toList());
    }
}