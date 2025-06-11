package com.soccer.fut7.soccer_system.team.helpers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.dto.common.PlayerDetailsDTO;
import com.soccer.fut7.soccer_system.dto.common.PlayerStatsDTO;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.team.adapter.PlayerAdapter;
import com.soccer.fut7.soccer_system.team.dto.projection.PlayerWithTeamAndStatsProjection;
import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;
import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.mapper.PlayerMapper;
import com.soccer.fut7.soccer_system.team.repository.CredentialRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.InscriptionRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.PlayerRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.PlayerStatsRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Lazy
@Slf4j
@RequiredArgsConstructor
public class PlayerCommandHelperRepository {
    private final InscriptionCommandHelperRepository inscriptionCommandHelperRepository;

    private final InscriptionRepositoryData inscriptionRepositoryData;

    private final CredentialRepositoryData credentialRepositoryData;
    private final TeamRepositoryData teamRepositoryData;

    private final PlayerRepositoryData playerRepositoryData;

    private final PlayerStatsRepositoryData playerStatsRepositoryData;

    private final PlayerMapper playerMapper;


    public List<PlayerStatsDTO> getPlayersOrganizedByPoints(UUID categoryId) {
        List<Object[]> rawResults = playerRepositoryData.findByTeamCategoryIdOrderByStatsPointsDesc(categoryId);

        return rawResults.stream()
                .map(row -> new PlayerStatsDTO(
                        (UUID) row[0], // player_id (p.id)
                        (String) row[1], // first_name
                        (String) row[2], // photo_url
                        (int) row[3], // jersey_number
                        (int) row[4], // goals
                        (int) row[5], // points
                        (int) row[6], // red_cards
                        (int) row[7], // yellow_cards
                        (UUID) row[8], // team_id
                        (String) row[9], // team_logo_url
                        (String) row[10], // team_name
                        (UUID) row[11], // category_id
                        (String) row[12] // category_name
                ))
                .collect(Collectors.toList());

    }

    @Transactional
    public Optional<PlayerEntity> registerPlayerWithBasicInfo(PlayerEntity playerEntity) {
        try {
            // Save the player first
            PlayerEntity savedPlayer = playerRepositoryData.save(playerEntity);

            // Get the team information
            TeamEntity team = teamRepositoryData.findById(savedPlayer.getTeam().getId()).orElse(null);
            if (team != null) {
                // Update the team's player count
                team.setNumberOfPlayers(team.getNumberOfPlayers() + 1);
                teamRepositoryData.save(team);

                // Find existing inscription for the team
                List<InscriptionEntity> inscriptions = inscriptionCommandHelperRepository
                        .findByTeamName(team.getTeamName());

                if (inscriptions.isEmpty()) {
                    // If no inscription exists, create a new one
                    InscriptionEntity inscription = InscriptionEntity.builder()
                            .nameTeam(team.getTeamName())
                            .numPlayer(team.getNumberOfPlayers())
                            .date(LocalDate.now())
                            .amount(BigDecimal.valueOf(120).multiply(BigDecimal.valueOf(team.getNumberOfPlayers())))
                            .build();

                    inscriptionRepositoryData.save(inscription);
                } else {
                    // Update the most recent inscription
                    InscriptionEntity inscription = inscriptions.stream()
                            .sorted((i1, i2) -> i2.getDate().compareTo(i1.getDate()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("No valid inscription found"));

                    // Increment player count
                    int newPlayerCount = inscription.getNumPlayer() + 1;

                    // Calculate new amount (120 per player)
                    BigDecimal newAmount = BigDecimal.valueOf(120).multiply(BigDecimal.valueOf(newPlayerCount));

                    // Update inscription
                    inscription.setNumPlayer(newPlayerCount);
                    inscription.setAmount(newAmount);
                    inscription.setDate(LocalDate.now()); // Update date to current date

                    inscriptionCommandHelperRepository.updateInscription(inscription);
                }
            }

            return Optional.of(savedPlayer);
        } catch (Exception e) {
            throw new RuntimeException("Failed to register player: " + e.getMessage(), e);
        }
    }

    public Optional<Boolean> registerBatchPlayerWithBasicInfo(Set<PlayerEntity> playerEntities) {
        if (playerEntities == null || playerEntities.isEmpty()) {
            return Optional.of(false);
        }

        try {
            // Process credentials and stats for all players
            List<CredentialEntity> credentials = new ArrayList<>();
            List<PlayerStatsEntity> playerStats = new ArrayList<>();

            TeamEntity team = teamRepositoryData.findById(playerEntities.iterator().next().getTeam().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            for (PlayerEntity player : playerEntities) {
                if (player == null)
                    continue;

                // Create credential
                credentials.add(CredentialEntity.builder()
                        .id(UUID.randomUUID())
                        .playerName(player.getFirstName() + " " + player.getLastName())
                        .description("Inscripción al equipo")
                        .createdAt(LocalDate.now())
                        .updatedAt(LocalDate.now())
                        .amount(BigDecimal.valueOf(120))
                        .build());

                // Create player stats
            }

            // Save all credentials and stats
            credentialRepositoryData.saveAll(credentials);
            playerStatsRepositoryData.saveAll(playerStats);

            // Handle inscription
            List<InscriptionEntity> inscriptions = inscriptionCommandHelperRepository
                    .findByTeamName(team.getTeamName());
            final int playerCount = playerEntities.size(); // Total new players being added

            if (inscriptions.isEmpty()) {
                // Create new inscription
                InscriptionEntity newInscription = InscriptionEntity.builder()
                        .nameTeam(team.getTeamName())
                        .numPlayer(playerCount)
                        .date(LocalDate.now())
                        .amount(calculateTotalAmount(playerCount))
                        .build();
                inscriptionRepositoryData.save(newInscription);
            } else {
                // Update most recent inscription
                InscriptionEntity latestInscription = inscriptions.stream()
                        .max(Comparator.comparing(InscriptionEntity::getDate))
                        .orElseThrow(() -> new IllegalStateException("No valid inscription found"));

                int updatedPlayerCount = latestInscription.getNumPlayer() + playerCount;
                latestInscription.setNumPlayer(updatedPlayerCount);
                latestInscription.setAmount(calculateTotalAmount(updatedPlayerCount));
                latestInscription.setDate(LocalDate.now());

                inscriptionCommandHelperRepository.updateInscription(latestInscription);
            }

            // Save all players at once
            playerRepositoryData.saveAll(playerEntities);
            return Optional.of(true);

        } catch (Exception e) {
            log.error("Failed to register batch players", e);
            return Optional.empty();
        }
    }

    private BigDecimal calculateTotalAmount(int playerCount) {
        return BigDecimal.valueOf(120).multiply(BigDecimal.valueOf(playerCount));
    }

    // e92b24bc-3fa5-463d-a7cd-66d27057471e 714ea933-e86c-40d1-8f23-4e1ab9ba0dbc
    public Optional<Boolean> updateBatchPlayerWithBasicInfo(Set<PlayerEntity> updateRequests) {
        if (updateRequests == null || updateRequests.isEmpty()) {
            return Optional.of(false);
        }

        updateRequests.forEach(updateRequest -> {
            if (updateRequest.getId() == null) {
                return; // Skip if no ID provided
            }

            playerRepositoryData.findById(updateRequest.getId()).ifPresent(existing -> {
                // Helper method to check if a String is null, empty, or "null"
                Predicate<String> isValidString = value -> value != null && !value.trim().isEmpty()
                        && !value.trim().equalsIgnoreCase("null");

                // Update only valid fields
                if (isValidString.test(updateRequest.getFirstName())) {
                    existing.setFirstName(updateRequest.getFirstName().trim());
                }
                if (isValidString.test(updateRequest.getLastName())) {
                    existing.setLastName(updateRequest.getLastName().trim());
                }
                if (updateRequest.getJerseyNumber() != null) {
                    existing.setJerseyNumber(updateRequest.getJerseyNumber());
                }
                if (updateRequest.getTeam() != null) {
                    existing.setTeam(updateRequest.getTeam());
                }
                if (updateRequest.getBirthDate() != null) {
                    existing.setBirthDate(updateRequest.getBirthDate());
                }
                if (isValidString.test(updateRequest.getPlayerStatus())) {
                    existing.setPlayerStatus(updateRequest.getPlayerStatus().trim());
                }
                if (updateRequest.getAge() != null) {
                    existing.setAge(updateRequest.getAge());
                }
                if (updateRequest.getCaptain() != null) {
                    existing.setCaptain(updateRequest.getCaptain());
                }
                if (isValidString.test(updateRequest.getEmail())) {
                    existing.setEmail(updateRequest.getEmail().trim());
                }
                if (updateRequest.getPhotoUrl() != null
                        && !updateRequest.getPhotoUrl().trim().equalsIgnoreCase("null")) {
                    existing.setPhotoUrl(updateRequest.getPhotoUrl().trim());
                }

                playerRepositoryData.save(existing);
            });
        });

        return Optional.of(true);
    }

    public Optional<PlayerEntity> updatePlayerBasicInfo(PlayerEntity playerEntity) {
        return playerRepositoryData.findById(playerEntity.getId())
                .map(existingPlayer -> {
                    existingPlayer.setFirstName(playerEntity.getFirstName());
                    existingPlayer.setLastName(playerEntity.getLastName());
                    existingPlayer.setJerseyNumber(playerEntity.getJerseyNumber());
                    existingPlayer.setTeam(playerEntity.getTeam());
                    existingPlayer.setBirthDate(playerEntity.getBirthDate());
                    existingPlayer.setPlayerStatus(playerEntity.getPlayerStatus());
                    existingPlayer.setCaptain(playerEntity.getCaptain());
                    existingPlayer.setEmail(playerEntity.getEmail());
                    return playerRepositoryData.save(existingPlayer);
                });
    }

    public Optional<Boolean> updatePhotoIdUser(UUID playerId, String photoId) {
        return playerRepositoryData.findByID(playerId)
                .map(player -> {
                    player.setPhotoUrl(photoId);
                    playerRepositoryData.save(player);
                    return true;
                });
    }

    public Optional<PlayerDetailsDTO> getPlayerFullDetails(UUID playerId) {
        Object[] result = (Object[]) playerRepositoryData.getPlayerDetailsById(playerId);

        if (result == null) {
            return Optional.empty();
        }
        // Handle java.sql.Date conversion to LocalDate
        LocalDate birthDate = null;
        if (result[5] != null) {
            birthDate = ((java.sql.Date) result[5]).toLocalDate();
        }
        return Optional.ofNullable(new PlayerDetailsDTO(
                result[0].toString(), // playerId
                result[1].toString(), // firstName
                result[2].toString(), // lastName
                result[3] != null ? (Integer) result[3] : 0, // jerseyNumber
                result[4] != null ? result[4].toString() : null, // photoUrl
                birthDate,
                result[6].toString(), // playerStatus
                result[7] != null ? (Boolean) result[7] : false, // captain
                result[8] != null ? result[8].toString() : null, // email
                result[9] != null ? (Integer) result[9] : 0, // age
                result[10] != null ? (Integer) result[10] : 0, // goals
                result[11] != null ? (Integer) result[11] : 0, // points
                result[12] != null ? (Integer) result[12] : 0, // statsJerseyNumber
                result[13] != null ? (Integer) result[13] : 0, // yellowCards
                result[14] != null ? (Integer) result[14] : 0, // redCards
                result[15] != null ? result[15].toString() : null, // teamId
                result[16] != null ? result[16].toString() : null // teamName
        ));
    }

    @Transactional

    public void deleteAllPlayersFromTeam(UUID teamId) {
        playerRepositoryData.deleteByTeam_Id(teamId);
    }

    public void removePlayerFromTeam(UUID playerId) {
        playerRepositoryData.deleteById(playerId);
    }

    @Transactional
    public Optional<PlayerEntity> updatePlayerPositionStats(UUID playerId, Integer goals, Integer points,
            CardsRecord card) {

        // Find the player projection first
        Optional<PlayerWithTeamAndStatsProjection> playerProjection = playerRepositoryData
                .findPlayerWithTeamAndStats(playerId);

        if (playerProjection.isEmpty()) {
            throw new RuntimeException("Player not found with ID: " + playerId);
        }

        // Map the projection to entity
        PlayerEntity player = playerMapper.projectionToEntity(playerProjection.get());

        // Update player stats
        playerStatsRepositoryData.findByPlayerId(playerId).ifPresentOrElse(playerStats -> {
            playerStats.setGoals(playerStats.getGoals() + goals);
            playerStats.setPoints(playerStats.getPoints() + points);
            playerStats.setRedCards(playerStats.getRedCards() + card.redCards());
            playerStats.setYellowCards(playerStats.getYellowCards() + card.yellowCards());
            playerStatsRepositoryData.save(playerStats);
            log.info("Player stats updated: Goals = {}, Points = {}, Yellow Cards = {}, Red Cards = {}",
                    playerStats.getGoals(), playerStats.getPoints(),
                    playerStats.getYellowCards(), playerStats.getRedCards());
        }, () -> {
            throw new RuntimeException("Player stats not found for player ID: " + playerId);
        });

        return Optional.of(player);
    }

    public Boolean createAllPlayerBasicWithoutTeam(Set<PlayerEntity> players) {
        Set<PlayerEntity> newPlayers = new HashSet<>();
        for (PlayerEntity player : players) {
            if (player.getEmail() == null || player.getEmail().isBlank()) {
                throw new IllegalArgumentException("Player email is required");
            }

            PlayerEntity newPlayer = new PlayerEntity();
            newPlayer.setFirstName(player.getFirstName());
            newPlayer.setLastName(player.getLastName());
            newPlayer.setEmail(player.getEmail());
            newPlayer.setJerseyNumber(player.getJerseyNumber());
            newPlayer.setBirthDate(player.getBirthDate());
            newPlayer.setPhotoUrl(player.getPhotoUrl());
            newPlayer.setPlayerStatus(
                    player.getPlayerStatus() != null ? player.getPlayerStatus()
                            : PlayerStatus.ACTIVO.toString());

            // Save player first to generate ID
            PlayerEntity savedPlayer = playerRepositoryData.save(newPlayer);

            // Create and save player stats
            PlayerStatsEntity playerStats = PlayerStatsEntity.builder()
                    .player(savedPlayer)
                    .goals(0)
                    .points(0)
                    .jerseyNumber(savedPlayer.getJerseyNumber())
                    .yellowCards(0)
                    .redCards(0)
                    .build();
            playerStatsRepositoryData.save(playerStats);

        }
        return true;
    }

    public List<PlayerEntity> getPlayersByName(String playerName) {
        return playerRepositoryData.findByNameContainingIgnoreCase(playerName);
    }

    @Transactional
    public void removePlayersFromTeam(UUID teamId, List<UUID> playerIds) {
        playerRepositoryData.deleteByTeamIdAndPlayerIds(teamId, playerIds);
    }

}