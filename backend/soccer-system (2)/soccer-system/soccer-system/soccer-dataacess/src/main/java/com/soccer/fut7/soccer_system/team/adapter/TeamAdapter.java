package com.soccer.fut7.soccer_system.team.adapter;
import com.soccer.fut7.soccer_system.team.mapper.TeamMapper;
import com.soccer.fut7.soccer_system.team.mapper.TeamStatsMapper;
import com.soccer.fut7.soccer_system.team.repository.CategoryRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.PlayerRepositoryData;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.helpers.TeamCommandHelperRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Lazy

@RequiredArgsConstructor
public class TeamAdapter implements TeamRepository {

    private final TeamMapper teamMapper_1;
    private final TeamCommandHelperRepository teamCommandHelperRepository;
    private final TeamMapper teamMapper;
    private final CategoryRepositoryData categoryRepositoryData;
    private final TeamStatsMapper teamStatsMapper;

    @Override
    public void deleteTeam(UUID teamId) {
        teamCommandHelperRepository.deleteTeam(teamId);
    }

    @Override
    public void updateTeamDetails(Team team) {
        TeamEntity teamEntity = teamMapper.toEntity(team);
        teamCommandHelperRepository.updateTeamDetails(teamEntity);
    }
    @Override
    public Optional<Team> createTeam(Team team) {
        return categoryRepositoryData.findById(team.getCategory().getId())
            .map(categoryEntity -> {
                TeamEntity teamEntity = teamMapper.toEntityWithPlayers(team);
                teamEntity.setCategory(categoryEntity);
                return teamMapper.toDomain(
                    teamCommandHelperRepository.createTeamWithPlayers(teamEntity)
                );
            });
    }
    @Override
    public Optional<Team> getTeam(UUID teamId) {
        return teamCommandHelperRepository.getTeam(teamId)
            .map(teamMapper::toDomain);
    }

    @Override
    public void deleteTeamByCategory(UUID categoryId, UUID teamId) {
        teamCommandHelperRepository.deleteTeamByCategory(categoryId, teamId);
    }

    @Override
    public void deleteAllTeamsByCategory(UUID categoryId) {
        teamCommandHelperRepository.deleteAllTeamsByCategory(categoryId);
    }

    @Override
    public Optional<Team> updateTeamByCategory(UUID categoryId, UUID teamId, Team updatedTeam) {
        // Verify category exists
        return categoryRepositoryData.findById(categoryId)
            .map(categoryEntity -> {
                TeamEntity teamEntity = teamMapper.toEntity(updatedTeam);
                return teamCommandHelperRepository.updateTeamByCategory(categoryId, teamId, teamEntity)
                    .map(teamMapper::toDomain);
            })
            .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));
    }

    @Override
    public Optional<Team> updateTeamNameOrLogo(UUID teamId, String name, String logo) {
        return teamCommandHelperRepository.updateTeamNameOrLogo(teamId, name, logo)
            .map(teamMapper::toDomain);
    }

    @Override
    public Optional<Boolean> existTeam(UUID teamId) {
        return teamCommandHelperRepository.existTeam(teamId);
    }

    @Override
    public Optional<Set<TeamStats>> getTeamsByPosition(UUID categoryId) {
        return teamCommandHelperRepository.getTeamsByPosition(categoryId)
            .map(teamStatsEntities -> teamStatsEntities.stream()
                .map(teamStatsMapper::toDomain)
                .collect(Collectors.toSet()));
    }

    @Override
    public Optional<Team> getTeamNameIdByNameAndCategory(String teamName, UUID categoryId) {
        return teamCommandHelperRepository.getTeamNameIdByNameAndCategory(teamName, categoryId)
            .map(teamMapper::toDomain);
    }

    @Override
    public Optional<Set<TeamStats>> getAllTeamFromCategory(UUID categoryId) {
        return teamCommandHelperRepository.getAllTeamFromCategory(categoryId)
            .map(teamStatsEntities -> teamStatsEntities.stream()
                .map(teamStatsMapper::toDomain)
                .collect(Collectors.toSet()));
    }

    @Override
    public Optional<Team> getTeamWithoutPlayers(UUID team) {
        return teamCommandHelperRepository.getTeamWithoutPlayers(team)
            .map(teamMapper::toDomain);
    }

    @Override
    public List<Team> getTeamsByName(String teamName) {
        // TODO Auto-generated method stub
        return teamCommandHelperRepository.getTeamsByName(teamName).stream()
            .map(teamMapper_1::toDomain)
            .collect(Collectors.toList());
    }
}