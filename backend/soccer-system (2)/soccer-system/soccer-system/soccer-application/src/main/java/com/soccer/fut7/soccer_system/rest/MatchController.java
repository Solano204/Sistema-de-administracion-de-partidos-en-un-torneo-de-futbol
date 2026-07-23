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

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchCreateRecord;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.ports.input.service.MatchApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Matches", description = "Matches within a category/tournament. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/matches")
@AllArgsConstructor
@Lazy

public class MatchController {

    @Autowired
    private MatchApplicationService matchApplicationService;


    // This will be the jouyners
    @Operation(summary = "List all matches in a category")
    @ApiResponse(responseCode = "200", description = "Matches returned")
    @GetMapping("/category/{categoryId}")
    public Set<MatchTinyDetails> getAllMatchesByCategory(@PathVariable UUID categoryId) {
        return matchApplicationService.getAllMatchesByCategory(categoryId);
    }


    // Here i need by category, tourmentId,by journeys, or by date primer o second division

    @Operation(summary = "Update a match's result stats")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Match updated"),
        @ApiResponse(responseCode = "404", description = "No match exists with that id in that tournament")
    })
    @PutMapping("/{matchId}/{tourment_Id}/updateMatchStats")
    public Match updateMatchStats(
            @PathVariable UUID matchId,
            @PathVariable UUID tourment_Id,
            @RequestBody MatchResults matchResults) {
        return matchApplicationService.updateMatchStats(matchId, tourment_Id, matchResults);
    }

      // Get match by ID (with stats) including tournament context
      @Operation(summary = "Get a match by id, including stats, within a tournament")
      @ApiResponses({
          @ApiResponse(responseCode = "200", description = "Match found"),
          @ApiResponse(responseCode = "404", description = "No match exists with that id in that tournament")
      })
      @GetMapping("/{matchId}/{tournamentId}/stats")
      public Match getMatchByIdWithStats(
              @PathVariable UUID matchId,
              @PathVariable UUID tournamentId) {
          Match match = matchApplicationService.getMatchByIdWithStats(matchId, tournamentId);
          return match;
        }


    // @PostMapping
    // public Match createMatch(
    //         @RequestBody MatchCreateRecord matchCreateRecord) {
    //     return matchApplicationService.createMatch(matchCreateRecord.homeTeamId(), matchCreateRecord.awayTeamId(),
    //             matchCreateRecord.matchDate(), matchCreateRecord.refereeId(), matchCreateRecord.categoryId());
    // }

    // // Update match status
    // @PutMapping("/{matchId}/{tournamentId}/status")
    // public Boolean updateMatchStatus(
    //         @PathVariable UUID matchId,
    //         @PathVariable UUID tournamentId,
    //         @RequestParam MatchStatus status) {
    //     return matchApplicationService.updateMatchStatus(matchId, tournamentId, status);
    // }

    // // Get matches by team (with stats) including tournament context
    // @GetMapping("/team/{teamId}/{tournamentId}/stats")
    // public List<Match> getMatchesByTeamWithStats(
    //         @PathVariable UUID teamId,
    //         @PathVariable UUID tournamentId) {
    //     return matchApplicationService.getMatchesByTeamWithStats(teamId, tournamentId);
    // }

    // // Get matches by team (without stats) including tournament context
    // @GetMapping("/team/{teamId}/{tournamentId}")
    // public List<Match> getMatchesByTeamWithoutStats(
    //         @PathVariable UUID teamId,
    //         @PathVariable UUID tournamentId) {
    //     return matchApplicationService.getMatchesByTeamWithoutStats(teamId, tournamentId);
    // }

    // Get match by ID (without stats) including tournament context
    // @GetMapping("/{matchId}/{tournamentId}")
    // public Match getMatchByIdWithoutStats(
    //         @PathVariable UUID matchId,
    //         @PathVariable UUID tournamentId) {
    //     return matchApplicationService.getMatchByIdWithoutStats(matchId, tournamentId);
    // }



    // @GetMapping("/between")
    // public List<Match> getMatchesBetweenTeamsWithStats(
    // @RequestParam UUID team1Id,
    // @RequestParam UUID team2Id) {
    // return matchApplicationService.getMatchesBetweenTeamsWithStats(team1Id,
    // team2Id);
    // }

    // @GetMapping("/between/no-stats")
    // public List<Match> getMatchesBetweenTeamsWithoutStats(
    // @RequestParam UUID team1Id,
    // @RequestParam UUID team2Id) {
    // return matchApplicationService.getMatchesBetweenTeamsWithoutStats(team1Id,
    // team2Id);
    // }
}
