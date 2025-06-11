package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.rmi.server.UID;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.swing.text.StyledEditorKit.BoldAction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ExceptionApplication.categoryException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.dto.team.TeamSummaryRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CategoryRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// The helper already workin' with object-domain to return to 
@Slf4j
@Component
@Lazy

@RequiredArgsConstructor
public class CommandHelperTeam {

    @Autowired
    private final EntityDtoMapperDomain mapper;
    private final TeamRepository teamRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public Team createNewTeam(TeamCreateRecord newTeam) {

        Category category = categoryRepository.existCategory(newTeam.categoryId())
                .orElseThrow(() -> new categoryException("Category not found"));
        Team team = mapper.teamCreateRecordToTeam(newTeam);
        team.setCategory(category);
        return getNewTeam(newTeam,category).orElseThrow(() -> new teamException("Team not found"));
    }

    public Optional<Team> getNewTeam(TeamCreateRecord newTeam, Category category) {
        Team team = mapper.teamCreateRecordToTeam(newTeam);
        team.setCategory(Category.builder().id(newTeam.categoryId()).name(category.getName()).ageRange(category.getAgeRange()).build());
        return teamRepository.createTeam(team);
    }

    public Team getTeamsNameIdByCategory(UUID categoryId, UUID teamId) {
        teamRepository.existTeam(teamId).orElseThrow(() -> new teamException("Team not found"));
        return (teamRepository.getTeam(teamId).orElseThrow(() -> new teamException("Team not found")));
    }
    public Team getTeamsNameIdByCategoryWithoutPlayers(UUID categoryId, UUID teamId) {
        teamRepository.existTeam(teamId).orElseThrow(() -> new teamException("Team not found"));
        return (teamRepository.getTeamWithoutPlayers(teamId).orElseThrow(() -> new teamException("Team not found")));
    }

   public List<TeamScore> getTeamsByPosition(UUID categoryId) {
    Set<TeamStats> teamStats = teamRepository.getTeamsByPosition(categoryId)
            .orElseThrow(() -> new teamException("No teams found"));

    return teamStats.stream()
            .map(teamStat -> mapper.teamStatsToTeamScore(teamStat))
            .sorted(Comparator.comparingInt(TeamScore::points).reversed())
            .collect(Collectors.toList());
}

    public Set<TeamScore> getAllTeamFromCategory(UUID categoryId) {
        Set<TeamStats> teamStats = teamRepository.getAllTeamFromCategory(categoryId)
                .orElseThrow(() -> new teamException("No teams found"));

        return teamStats.stream().map(teamStat -> mapper.teamStatsToTeamScore(teamStat)).collect(Collectors.toSet());
    }

    public void deleteTeamByCategory(UUID categoryId, UUID teamId) {
        teamRepository.deleteTeamByCategory(categoryId, teamId);
    }

    public Team updateTeamByCategory(UUID categoryId, UUID teamId, TeamDetailsRecord updatedTeam) {
        Team team = mapper.teamDetailsRecordToTeam(updatedTeam);
      return   teamRepository.updateTeamByCategory(categoryId, teamId, team).orElseThrow(() -> new teamException("Team not found"));

    }
    
    public Team updateTeamByCategoryLogoOrName(UUID categoryId, UUID teamId, String logo, String name) {
      return teamRepository.updateTeamNameOrLogo(teamId, name, logo).orElseThrow(() -> new teamException("Team not found"));


    }


    public Boolean existTeam(UUID newTeam) {
        return teamRepository.existTeam(newTeam).orElse(false);
    }
    public void deleteAllTeamByCategory(UUID categoryId) {
        teamRepository.deleteAllTeamsByCategory(categoryId);
    }

    public Team getTeamWithoutPlayers(UUID teamId, UUID categoryId) {
        return getTeamsNameIdByCategory(categoryId, teamId);
    }

    public List<TeamNameIdRecord> getTeamsByName(String teamName) {
        return mapper.teamsToTeamNameIdRecords(teamRepository.getTeamsByName(teamName));
    }

    

}
