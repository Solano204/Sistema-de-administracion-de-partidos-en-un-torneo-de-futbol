package com.soccer.fut7.soccer_system.team.helpers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;
import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;
import com.soccer.fut7.soccer_system.team.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@Lazy
@RequiredArgsConstructor
public class TeamCommandHelperRepository {

    private final InscriptionRepositoryData inscriptionRepositoryData;
    private final TeamRepositoryData teamRepositoryData;
    private final TeamStatsRepositoryData teamStatsRepositoryData;
    private final CategoryRepositoryData categoryRepositoryData;
    private final PlayerStatsRepository playerStatsRepository;
    private final CredentialRepositoryData credentialRepositoryData;
    private final PlayerRepositoryData playerRepositoryData;
    

    public void deleteTeam(UUID teamId) {
        teamRepositoryData.deleteById(teamId);
    }
    @Transactional

    public void updateTeamDetails(TeamEntity teamEntity) {
        teamRepositoryData.save(teamEntity);
    }

    // public Optional<TeamEntity> createTeam(TeamEntity teamEntity) {
    // TeamEntity savedTeam = teamRepositoryData.save(teamEntity);
    // playerRepositoryData.saveAll(teamEntity.getPlayers());
    // return Optional.of(savedTeam);
    // }

@Transactional
public TeamEntity createTeamWithPlayers(TeamEntity teamEntity) {
    try {
        if (teamEntity == null) {
            throw new IllegalArgumentException("Team cannot be null");
        }

        // Create and save the team first
        TeamEntity newTeam = new TeamEntity();
        newTeam.setTeamName(teamEntity.getTeamName());
        newTeam.setLogoUrl(teamEntity.getLogoUrl());
        newTeam.setNumberOfPlayers(0);

        if (teamEntity.getCategory() == null || teamEntity.getCategory().getId() == null) {
            throw new IllegalArgumentException("Team must have a valid category");
        }
        CategoryEntity category = categoryRepositoryData.findById(teamEntity.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        newTeam.setCategory(category);

        // Save team first to generate ID
        TeamEntity savedTeam = teamRepositoryData.save(newTeam);

        // Create and save team stats
        TeamStatsEntity teamStats = TeamStatsEntity.builder()
                .team(savedTeam)
                .goals(0)
                .goalsAgainst(0)
                .matchesPlayed(0)
                .matchesWon(0)
                .matchesDrawn(0)
                .matchesLost(0)
                .points(0)
                .build();
        teamStatsRepositoryData.save(teamStats);

        // Process players if any
        if (teamEntity.getPlayers() != null && !teamEntity.getPlayers().isEmpty()) {
            Set<PlayerEntity> newPlayers = new HashSet<>();
            for (PlayerEntity player : teamEntity.getPlayers()) {
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
                newPlayer.setAge(player.getAge());
                newPlayer.setCaptain(player.getCaptain());
                newPlayer.setPlayerStatus(
                        player.getPlayerStatus() != null ? player.getPlayerStatus()
                                : PlayerStatus.ACTIVO.toString());
                newPlayer.setTeam(savedTeam);

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
                playerStatsRepository.save(playerStats);

                newPlayers.add(savedPlayer);

                CredentialEntity credential = CredentialEntity.builder()
                .id(UUID.randomUUID())
                    .playerName(savedPlayer.getFirstName() + " " + savedPlayer.getLastName())
                    .description("Incripcion al equipo")
                    .createdAt(LocalDate.now())
                    .updatedAt(LocalDate.now())
                    .amount(BigDecimal.valueOf(120))
                .build();
                credentialRepositoryData.save(credential);
            }
            savedTeam.setPlayers(newPlayers);
            savedTeam.setTeamStats(teamStats);
            savedTeam.setNumberOfPlayers(newPlayers.size());
            
            // Save team again with players
            savedTeam = teamRepositoryData.save(savedTeam);
        }

        // Create inscription record for the team
        // Calculate amount: 120 per player
        BigDecimal amount = BigDecimal.valueOf(120).multiply(BigDecimal.valueOf(savedTeam.getNumberOfPlayers()));
        
        InscriptionEntity inscription = InscriptionEntity.builder()
                .nameTeam(savedTeam.getTeamName())
                .numPlayer(savedTeam.getNumberOfPlayers())
                .date(LocalDate.now())
                .amount(amount)
                .build();
        
        inscriptionRepositoryData.save(inscription);

        return savedTeam;

    } catch (DataIntegrityViolationException e) {
        throw new teamException("Database error: " + e.getMessage(), e);
    } catch (IllegalArgumentException e) {
        throw e;
    } catch (Exception e) {
        throw new teamException("Unexpected error: " + e.getMessage(), e);
    }
}


    public Optional<TeamEntity> getTeam(UUID teamId) {

        TeamEntity team = teamRepositoryData.findById(teamId).orElseThrow(() -> new teamException("Team not found"));
        TeamStatsEntity teamStatsEntity = teamStatsRepositoryData.findStatsByTeamId(teamId)
        .orElseGet(() -> new TeamStatsEntity()); // Return empty stats if none exists
        team.setTeamStats(teamStatsEntity);
        team.getPlayers().forEach(player -> {
            PlayerStatsEntity playerStats = playerStatsRepository.findByPlayerId(player.getId())
            .orElseGet(() -> new PlayerStatsEntity()); // Empty stats if none exists}
            player.setPlayerStats(playerStats);
        });
        return Optional.of(team);
    }
    public Optional<TeamEntity> getTeamWithoutPlayers(UUID teamId) {

        TeamEntity team = teamRepositoryData.findById(teamId).orElseThrow(() -> new teamException("Team not found"));
        TeamStatsEntity teamStatsEntity = teamStatsRepositoryData.findStatsByTeamId(teamId)
        .orElseGet(() -> new TeamStatsEntity()); // Return empty stats if none exists
        team.setTeamStats(teamStatsEntity);
        return Optional.of(team);
    }

    public void deleteTeamByCategory(UUID categoryId, UUID teamId) {
        teamRepositoryData.deleteByCategory_IdAndId(categoryId, teamId);
    }

    public void deleteAllTeamsByCategory(UUID categoryId) {
        teamRepositoryData.deleteByCategoryId(categoryId);
    }

    public Optional<TeamEntity> updateTeamByCategory(UUID categoryId, UUID teamId, TeamEntity updatedTeamEntity) {
        return teamRepositoryData.findByCategory_IdAndId(categoryId, teamId)
                .map(existingTeam -> {
                    // Only update fields that are not null in the updated entity
                    if (updatedTeamEntity.getTeamName() != null) {
                        existingTeam.setTeamName(updatedTeamEntity.getTeamName());
                    }
                    if (updatedTeamEntity.getLogoUrl() != null) {
                        existingTeam.setLogoUrl(updatedTeamEntity.getLogoUrl());
                    }
                    if (updatedTeamEntity.getNumberOfPlayers() != null) {
                        existingTeam.setNumberOfPlayers(updatedTeamEntity.getNumberOfPlayers());
                    }
                    return teamRepositoryData.save(existingTeam);
                });
    }



    public Optional<TeamEntity> updateTeamNameOrLogo(UUID teamId, String name, String logo) {
        return teamRepositoryData.findById(teamId)
                .map(existingTeam -> {
                    if (name != null && !name.isBlank())
                        existingTeam.setTeamName(name);
                    if (logo != null && !logo.isBlank())
                        existingTeam.setLogoUrl(logo);
                    return teamRepositoryData.save(existingTeam);
                });
    }

    public Optional<Boolean> existTeam(UUID teamId) {
        return Optional.of(teamRepositoryData.existsById(teamId));
    }

    public Optional<Set<TeamStatsEntity>> getTeamsByPosition(UUID categoryId) {
        List<TeamStatsEntity> teamStats = teamStatsRepositoryData.findByTeam_Category_IdOrderByPointsDesc(categoryId);
        return Optional.of(new HashSet<>(teamStats));
    }

    public Optional<TeamEntity> getTeamNameIdByNameAndCategory(String teamName, UUID categoryId) {
        return teamRepositoryData.findByTeamNameAndCategory_Id(teamName, categoryId);
    }

    public Optional<Set<TeamStatsEntity>> getAllTeamFromCategory(UUID categoryId) {
        List<TeamStatsEntity> teamStats = teamStatsRepositoryData.findByTeam_Category_Id(categoryId);
        return Optional.of(new HashSet<>(teamStats));
    }

    public List<TeamEntity> getTeamsByName(String teamName) {
            return teamRepositoryData.findByTeamNameContainingIgnoreCase(teamName);
    }
}