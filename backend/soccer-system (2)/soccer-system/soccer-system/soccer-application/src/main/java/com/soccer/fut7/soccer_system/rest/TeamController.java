package com.soccer.fut7.soccer_system.rest;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamResultRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;

import lombok.AllArgsConstructor;

@RestController
@Lazy

@RequestMapping("/teams")
@AllArgsConstructor
public class TeamController {
    
    @Autowired
    private TeamApplicationService teamApplicationService;
    
    @PostMapping
    public TeamDetailsRecord createNewTeam(@RequestBody TeamCreateRecord newTeam) {
        return teamApplicationService.createNewTeam(newTeam);
    }
    
    @GetMapping("/exist")
    public Boolean existTeam(@RequestParam UUID team) {
        return teamApplicationService.existTeam(team);
    }
    
    @GetMapping("/{teamId}/category/{categoryId}")
    public TeamDetailsRecord getTeamWithoutPlayers(
            @PathVariable UUID teamId, 
            @PathVariable UUID categoryId) {
        return teamApplicationService.getTeamWithoutPlayers(teamId, categoryId);
    }
    
    @GetMapping("/category/{categoryId}/team/{teamId}/players")
    public TeamWithPlayersRecord getTeamsNameIdByCategoryWithPlayers(
            @PathVariable UUID categoryId, 
            @PathVariable UUID teamId) {
        return teamApplicationService.getTeamsNameIdByCategoryWithPlayers(categoryId, teamId);
    }
    
    @DeleteMapping("/category/{categoryId}/team/{teamId}")
    public void deleteTeamByCategory(
            @PathVariable UUID categoryId, 
            @PathVariable UUID teamId) {
        teamApplicationService.deleteTeamByCategory(categoryId, teamId);
    }
    
    @DeleteMapping("/category/{categoryId}")
    public void deleteAllTeamByCategory(@PathVariable UUID categoryId) {
        teamApplicationService.deleteAllTeamByCategory(categoryId);
    }
    
    @PutMapping("/category/{categoryId}/team/{teamId}")
    public TeamDetailsRecord updateTeamByCategory(
            @PathVariable UUID categoryId, 
            @PathVariable UUID teamId, 
            @RequestBody TeamDetailsRecord updatedTeam) {
        return teamApplicationService.updateTeamByCategory(categoryId, teamId, updatedTeam);
    }
   
    
    @GetMapping("/category/{categoryId}/position")
    public List<TeamScore> getTeamsByPosition(@PathVariable UUID categoryId) {
        return teamApplicationService.getTeamsByPosition(categoryId);
    }
    

    @GetMapping("/category/{categoryId}")
    public Set<TeamScore> getAllTeamFromCategory(@PathVariable UUID categoryId) {
        return teamApplicationService.getAllTeamFromCategory(categoryId);
    }
    
    @PutMapping("/category/{categoryId}/team/{teamId}/logo-name")
    public TeamDetailsRecord updateTeamByCategoryWithLogoOrName(
            @PathVariable UUID categoryId, 
            @PathVariable UUID teamId, 
            @RequestParam String logo, 
            @RequestParam String name) {
        return teamApplicationService.updateTeamByCategoryWithLogoOrName(categoryId, teamId, logo, name);
    }

   
}