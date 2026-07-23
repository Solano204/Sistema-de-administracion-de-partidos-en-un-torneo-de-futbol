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

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerStatsUpdateRequest;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerUpdateDetails;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Players", description = "Players attached to a team. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/players")
@AllArgsConstructor
@Lazy
@Slf4j
public class PlayerController {

    @Autowired
    private PlayerApplicationService playerApplicationService;

    @Operation(summary = "List players in a category, ordered by points")
    @ApiResponse(responseCode = "200", description = "Players returned, highest points first")
    @GetMapping("/category/{categoryId}/organized")
    public Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(@PathVariable UUID categoryId) {
        return playerApplicationService.getPlayersOrganizedByPoints(categoryId);
    }

    @Operation(summary = "Register a new player")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Player created"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PostMapping
    public Player registerBasicPlayer(@RequestBody PlayerCreateRecord playerCreate) {
        return playerApplicationService.registerBasicPlayer(playerCreate);
    }

    @Operation(summary = "Get a player's full details by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Player found"),
        @ApiResponse(responseCode = "404", description = "No player exists with that id")
    })
    @GetMapping("/{playerId}")
    public PlayerDetailsRecord getPlayerFullDetails(@PathVariable UUID playerId) {
        return playerApplicationService.getPlayerFullDetails(playerId);
    }

    @Operation(summary = "Update a player's position, goals, points and cards")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Stats updated"),
        @ApiResponse(responseCode = "404", description = "No player exists with that id")
    })
    @PutMapping("/{playerId}/stats")
    public Player updatePlayerPositionStats(
            @PathVariable UUID playerId,
            @RequestBody PlayerStatsUpdateRequest statsUpdateRequest) {
        log.info("statsUpdateRequest: {}", statsUpdateRequest);
        return playerApplicationService.updatePlayerPositionStats(playerId, statsUpdateRequest.goalsRecord(),
                statsUpdateRequest.pointsRecord(), statsUpdateRequest.card());
    }

    @Operation(summary = "Update a player's profile photo")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Photo updated"),
        @ApiResponse(responseCode = "404", description = "No player exists with that id")
    })
    @PutMapping("/{playerId}/photo")
    public Boolean updatePhotoIdUser(
            @PathVariable UUID playerId,
            @RequestParam String photoId) {
        return playerApplicationService.updatePhotoIdUser(playerId, photoId);
    }

    @Operation(summary = "Delete every player from a team")
    @ApiResponse(responseCode = "200", description = "Players deleted")
    @DeleteMapping("/team/{teamId}")
    public void deleteAllPlayersFromTeam(@PathVariable UUID teamId) {
        playerApplicationService.deleteAllPlayersFromTeam(teamId);
    }

    @Operation(summary = "Remove a single player from their team")
    @ApiResponse(responseCode = "200", description = "Player removed from team")
    @DeleteMapping("/{playerId}/team")
    public void removePlayerFromTeam(@PathVariable UUID playerId) {
        playerApplicationService.removePlayerFromTeam(playerId);

    }

    @Operation(summary = "Remove a batch of players from a team")
    @ApiResponse(responseCode = "200", description = "Players removed from team")
    @DeleteMapping("/deleteplayers/team/{teamId}")
    public void removePlayersFromTeam(
        @PathVariable UUID teamId,
        @RequestBody List<UUID> playerIds) {
        playerApplicationService.removePlayersFromTeam(teamId, playerIds);
    }

    @Operation(summary = "Create a batch of players' basic information for a team")
    @ApiResponse(responseCode = "200", description = "Players created")
    @PutMapping("/playerUpdateBatch/team/{teamId}")
    public Boolean createBasicInformationIdPlayer(@RequestBody Set<PlayerCreateRecord> playerCreate,@PathVariable UUID teamId) {
        return playerApplicationService.createBasicInformationBatchDetails(playerCreate,teamId);
    }

    // @PutMapping("/playerUpdateBatch/withoutTeam")
    // public Boolean updateBasicInformationIdPlayerWithoutTeam(@RequestBody Set<PlayerCreateRecord> playerCreate) {
    //     return playerApplicationService.updateBasicInformationBatchDetails(playerCreate);
    // }


    // @PutMapping("/batch")
    // public Boolean updateBasicInformation(@RequestBody Set<PlayerCreateRecord>
    // playerCreate) {
    // return playerApplicationService.updateBasicInformation(playerCreate);
    // }
    @Operation(summary = "Update a batch of players' basic information")
    @ApiResponse(responseCode = "200", description = "Players updated")
    @PutMapping("/playerUpdateBatch")
    public Boolean updateBasicInformationIdPlayer(@RequestBody Set<PlayerCreateRecord> playerCreate) {
        return playerApplicationService.updateBasicInformationBatchDetails(playerCreate);
    }



}
