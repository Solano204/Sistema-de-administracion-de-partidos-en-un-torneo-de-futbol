package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.ports.input.service.TournamentApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


@Tag(name = "Tournaments", description = "Tournament lifecycle: initialization, divisions, phases, scheduling and simulation. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@Lazy
@RequestMapping("/tournaments")
@AllArgsConstructor
public class TournamentController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TournamentController.class);
    @Autowired
    private TournamentApplicationService tournamentApplicationService;

    @Operation(summary = "Initialize a tournament")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tournament initialized"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping("/initialize")
    public TournamentInfoRecord initializeTournament(@RequestBody TournamentInfoRecord tournamentInfo) {
        return tournamentApplicationService.initializeTournament(tournamentInfo);
    }

    @Operation(summary = "Simulate the round-robin phase of a tournament")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Round-robin matches simulated"),
        @ApiResponse(responseCode = "404", description = "No tournament exists with that id")
    })
    @PostMapping("/{tournamentId}/simulate-round-robin")
    public void simulateRoundRobinMatches(@PathVariable UUID tournamentId) {
        tournamentApplicationService.simulateRoundRobinMatches(tournamentId);
    }

    @Operation(summary = "Create the elimination divisions for a tournament")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Divisions created"),
        @ApiResponse(responseCode = "404", description = "No tournament exists with that id")
    })
    @PostMapping("/{tournamentId}/create-divisions")
    public void createTournamentDivisions(@PathVariable UUID tournamentId) {
        tournamentApplicationService.createTournamentDivisions(tournamentId);
    }

    @Operation(summary = "Advance a division to its next phase")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Division advanced"),
        @ApiResponse(responseCode = "404", description = "No tournament or division exists with that name")
    })
    @PostMapping("/{tournamentId}/advance-phase")
    public void advanceToNextPhase(
            @PathVariable UUID tournamentId,
            @RequestParam String divisionName) {
        tournamentApplicationService.advanceToNextPhase(tournamentId, divisionName);
    }

    @Operation(summary = "Simulate the elimination matches for a division")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Elimination matches simulated"),
        @ApiResponse(responseCode = "404", description = "No tournament or division exists with that name")
    })
    @PostMapping("/{tournamentId}/simulate-elimination")
    public void simulateEliminationMatches(
            @PathVariable UUID tournamentId,
            @RequestParam String divisionName) {
        tournamentApplicationService.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
    }



    @Operation(summary = "Check whether a division can advance to the next phase")
    @ApiResponse(responseCode = "200", description = "Advancement status returned")
    @GetMapping("/{tournamentId}/divisions/{divisionId}/{categoryId}/advancement-status")
    public ResponseEntity<DivisionAdvancementStatus> canAdvanceDivision(
            @PathVariable UUID tournamentId,
            @PathVariable UUID divisionId,
            @PathVariable UUID categoryId) {

        DivisionAdvancementStatus status = tournamentApplicationService.canAdvanceDivision(
                divisionId, tournamentId, categoryId);
        return ResponseEntity.ok(status);
    }

    @Operation(summary = "Get the current stage of a tournament for a category")
    @ApiResponse(responseCode = "200", description = "Stage info returned")
    @GetMapping("/{tournamentId}/divisions/{categoryId}/check-out")
    public TournamentStageInfo checkTournamentStage(@PathVariable UUID tournamentId, @PathVariable UUID categoryId) {
        return tournamentApplicationService.checkTournamentStage(tournamentId, categoryId);
    }

    @Operation(summary = "List tournaments for a category")
    @ApiResponse(responseCode = "200", description = "Tournaments returned (possibly empty)")
    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<List<TournamentInfoRecord>> getTournamentsForCategory(
            @PathVariable UUID categoryId) {

        List<TournamentInfoRecord> tournaments = tournamentApplicationService.getTournamentsForCategory(categoryId);
        return ResponseEntity.ok(tournaments);
    }

    @Operation(summary = "List the divisions for a tournament")
    @ApiResponse(responseCode = "200", description = "Divisions returned (possibly empty)")
    @GetMapping("/{tournamentId}/divisions")
    public ResponseEntity<List<DivisionEntity>> getDivisionsForTournament(
            @PathVariable UUID tournamentId) {
        List<DivisionEntity> divisions = tournamentApplicationService
                .getDivisionsForTournament(tournamentId);
        return ResponseEntity.ok(divisions);
    }

    @Operation(summary = "Schedule a batch of matches for the week")
    @ApiResponse(responseCode = "201", description = "Matches scheduled")
    @PostMapping("/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Boolean> scheduleMatch(@RequestBody List<WeeklyScheduleRecordRequest> weeklySchedule) {
        Boolean success = tournamentApplicationService.scheduleMatchs(weeklySchedule);
        return ResponseEntity.status(HttpStatus.CREATED).body(success);
    }

    @Operation(summary = "List matches scheduled within a date range", description = "startDate/endDate are ISO-8601 dates (yyyy-MM-dd).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Matches returned (possibly empty)"),
        @ApiResponse(responseCode = "400", description = "startDate/endDate missing, unparsable, or startDate after endDate")
    })
    @GetMapping("/matches")
    public ResponseEntity<List<MatchScheduleInfoRecord>> getMatchesInDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        // Add null/empty checks
        if (startDate == null || startDate.isEmpty() ||
            endDate == null || endDate.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            LocalDate start = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE);
            LocalDate end = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE);

            if (start.isAfter(end)) {
                return ResponseEntity.badRequest().build();
            }

            List<MatchScheduleInfoRecord> matches = tournamentApplicationService.getMatchesInDateRange(start, end);
            return ResponseEntity.ok(matches);
        } catch (DateTimeParseException e) {
            log.error("Date parsing error", e);
            return ResponseEntity.badRequest().build();
        }
    }


    @Operation(summary = "Delete a scheduled match")
    @ApiResponse(responseCode = "200", description = "Match deleted")
    @DeleteMapping("/delete-match/{matchId}")
    public void deleteScheduleMatch(@PathVariable UUID matchId) {
        tournamentApplicationService.deleteScheduleMatch(matchId);
    }

    @Operation(summary = "Check whether a match exists")
    @ApiResponse(responseCode = "200", description = "true if the match exists")
    @GetMapping("/existing-match/{matchId}")
    public ResponseEntity<Boolean> existingMatch(@PathVariable UUID matchId) {
        return ResponseEntity.ok(tournamentApplicationService.matchExists(matchId));

    }


    @Operation(summary = "Mark a match as played")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Match status updated"),
        @ApiResponse(responseCode = "404", description = "No match exists with that id")
    })
    @PutMapping("/update-status-played/{matchId}")
    public Boolean putMethodName(@PathVariable String matchId) {
        return tournamentApplicationService.updateMatchStatus(UUID.fromString(matchId), MatchStatus.JUGADO);
    }



    @Operation(summary = "Delete a tournament and everything scheduled within it")
    @ApiResponse(responseCode = "200", description = "Tournament deleted")
    @DeleteMapping("/delete-all-in-tournament/{tournamentId}")
    public void deleteAllInTournament(@PathVariable UUID tournamentId) {
        tournamentApplicationService.deleteTournament(tournamentId);
    }

    @Operation(summary = "Remove every team from a category")
    @ApiResponse(responseCode = "200", description = "Teams removed from category")
    @DeleteMapping("/delete-teams-from-category/{categoryId}")
    public void deleteTeamsFromCategory(@PathVariable UUID categoryId) {
        tournamentApplicationService.deleteTeamsFromCategory(categoryId);
    }

    @Operation(summary = "Get the number of teams in a category")
    @ApiResponse(responseCode = "200", description = "Team count returned")
    @GetMapping("/amountTeams/{categoryId}")
    public int getAmountTeams(@PathVariable UUID categoryId) {
        return tournamentApplicationService.getNumberOfTeams(categoryId);
    }

}
