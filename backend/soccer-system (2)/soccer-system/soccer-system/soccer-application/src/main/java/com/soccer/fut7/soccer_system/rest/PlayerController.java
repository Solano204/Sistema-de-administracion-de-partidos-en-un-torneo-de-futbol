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

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/players")
@AllArgsConstructor
@Lazy
@Slf4j
public class PlayerController {

    @Autowired
    private PlayerApplicationService playerApplicationService;

    @GetMapping("/category/{categoryId}/organized")
    public Set<PlayerOrganizedRecord> getPlayersOrganizedByPoints(@PathVariable UUID categoryId) {
        return playerApplicationService.getPlayersOrganizedByPoints(categoryId);
    }

    @PostMapping
    public Player registerBasicPlayer(@RequestBody PlayerCreateRecord playerCreate) {
        return playerApplicationService.registerBasicPlayer(playerCreate);
    }

    @GetMapping("/{playerId}")
    public PlayerDetailsRecord getPlayerFullDetails(@PathVariable UUID playerId) {
        return playerApplicationService.getPlayerFullDetails(playerId);
    }

    @PutMapping("/{playerId}/stats")
    public Player updatePlayerPositionStats(
            @PathVariable UUID playerId,
            @RequestBody PlayerStatsUpdateRequest statsUpdateRequest) {
        log.info("statsUpdateRequest: {}", statsUpdateRequest);
        return playerApplicationService.updatePlayerPositionStats(playerId, statsUpdateRequest.goalsRecord(),
                statsUpdateRequest.pointsRecord(), statsUpdateRequest.card());
    }

    @PutMapping("/{playerId}/photo")
    public Boolean updatePhotoIdUser(
            @PathVariable UUID playerId,
            @RequestParam String photoId) {
        return playerApplicationService.updatePhotoIdUser(playerId, photoId);
    }

    @DeleteMapping("/team/{teamId}")
    public void deleteAllPlayersFromTeam(@PathVariable UUID teamId) {
        playerApplicationService.deleteAllPlayersFromTeam(teamId);
    }

    @DeleteMapping("/{playerId}/team")
    public void removePlayerFromTeam(@PathVariable UUID playerId) {
        playerApplicationService.removePlayerFromTeam(playerId);

    }

    @DeleteMapping("/deleteplayers/team/{teamId}")
    public void removePlayersFromTeam(
        @PathVariable UUID teamId, 
        @RequestBody List<UUID> playerIds) {
        playerApplicationService.removePlayersFromTeam(teamId, playerIds);
    }
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
    @PutMapping("/playerUpdateBatch")
    public Boolean updateBasicInformationIdPlayer(@RequestBody Set<PlayerCreateRecord> playerCreate) {
        return playerApplicationService.updateBasicInformationBatchDetails(playerCreate);
    }
    
   
  
}