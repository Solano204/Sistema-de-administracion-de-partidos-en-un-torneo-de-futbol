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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Teams", description = "Teams within a category (division). Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@Lazy

@RequestMapping("/teams")
@AllArgsConstructor
public class TeamController {

    @Autowired
    private TeamApplicationService teamApplicationService;

    @Operation(summary = "Create a team")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team created"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PostMapping
    public TeamDetailsRecord createNewTeam(@RequestBody TeamCreateRecord newTeam) {
        return teamApplicationService.createNewTeam(newTeam);
    }

    @Operation(summary = "Check whether a team exists")
    @ApiResponse(responseCode = "200", description = "true if the team exists")
    @GetMapping("/exist")
    public Boolean existTeam(@RequestParam UUID team) {
        return teamApplicationService.existTeam(team);
    }

    @Operation(summary = "Get a team's details (without its player roster)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team found"),
        @ApiResponse(responseCode = "404", description = "No team exists with that id in that category")
    })
    @GetMapping("/{teamId}/category/{categoryId}")
    public TeamDetailsRecord getTeamWithoutPlayers(
            @PathVariable UUID teamId,
            @PathVariable UUID categoryId) {
        return teamApplicationService.getTeamWithoutPlayers(teamId, categoryId);
    }

    @Operation(summary = "Get a team including its full player roster")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team and players found"),
        @ApiResponse(responseCode = "404", description = "No team exists with that id in that category")
    })
    @GetMapping("/category/{categoryId}/team/{teamId}/players")
    public TeamWithPlayersRecord getTeamsNameIdByCategoryWithPlayers(
            @PathVariable UUID categoryId,
            @PathVariable UUID teamId) {
        return teamApplicationService.getTeamsNameIdByCategoryWithPlayers(categoryId, teamId);
    }

    @Operation(summary = "Delete a team from a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team deleted"),
        @ApiResponse(responseCode = "409", description = "Team has players/matches referencing it (foreign key violation)")
    })
    @DeleteMapping("/category/{categoryId}/team/{teamId}")
    public void deleteTeamByCategory(
            @PathVariable UUID categoryId,
            @PathVariable UUID teamId) {
        teamApplicationService.deleteTeamByCategory(categoryId, teamId);
    }

    @Operation(summary = "Delete every team in a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Teams deleted"),
        @ApiResponse(responseCode = "409", description = "A team has players/matches referencing it (foreign key violation)")
    })
    @DeleteMapping("/category/{categoryId}")
    public void deleteAllTeamByCategory(@PathVariable UUID categoryId) {
        teamApplicationService.deleteAllTeamByCategory(categoryId);
    }

    @Operation(summary = "Update a team's details")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team updated"),
        @ApiResponse(responseCode = "404", description = "No team exists with that id in that category")
    })
    @PutMapping("/category/{categoryId}/team/{teamId}")
    public TeamDetailsRecord updateTeamByCategory(
            @PathVariable UUID categoryId,
            @PathVariable UUID teamId,
            @RequestBody TeamDetailsRecord updatedTeam) {
        return teamApplicationService.updateTeamByCategory(categoryId, teamId, updatedTeam);
    }


    @Operation(summary = "Get standings for a category, ordered by position")
    @ApiResponse(responseCode = "200", description = "Standings returned, best position first")
    @GetMapping("/category/{categoryId}/position")
    public List<TeamScore> getTeamsByPosition(@PathVariable UUID categoryId) {
        return teamApplicationService.getTeamsByPosition(categoryId);
    }


    @Operation(summary = "Get every team's score in a category")
    @ApiResponse(responseCode = "200", description = "Scores returned")
    @GetMapping("/category/{categoryId}")
    public Set<TeamScore> getAllTeamFromCategory(@PathVariable UUID categoryId) {
        return teamApplicationService.getAllTeamFromCategory(categoryId);
    }

    @Operation(summary = "Update just a team's logo and/or name")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Team updated"),
        @ApiResponse(responseCode = "404", description = "No team exists with that id in that category")
    })
    @PutMapping("/category/{categoryId}/team/{teamId}/logo-name")
    public TeamDetailsRecord updateTeamByCategoryWithLogoOrName(
            @PathVariable UUID categoryId,
            @PathVariable UUID teamId,
            @RequestParam String logo,
            @RequestParam String name) {
        return teamApplicationService.updateTeamByCategoryWithLogoOrName(categoryId, teamId, logo, name);
    }


}
