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


@RestController
@Lazy
@RequestMapping("/tournaments")
@AllArgsConstructor
public class TournamentController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TournamentController.class);
    @Autowired
    private TournamentApplicationService tournamentApplicationService;

    @PostMapping("/initialize")
    public TournamentInfoRecord initializeTournament(@RequestBody TournamentInfoRecord tournamentInfo) {
        return tournamentApplicationService.initializeTournament(tournamentInfo);
    }

    @PostMapping("/{tournamentId}/simulate-round-robin")
    public void simulateRoundRobinMatches(@PathVariable UUID tournamentId) {
        tournamentApplicationService.simulateRoundRobinMatches(tournamentId);
    }

    @PostMapping("/{tournamentId}/create-divisions")
    public void createTournamentDivisions(@PathVariable UUID tournamentId) {
        tournamentApplicationService.createTournamentDivisions(tournamentId);
    }

    @PostMapping("/{tournamentId}/advance-phase")
    public void advanceToNextPhase(
            @PathVariable UUID tournamentId,
            @RequestParam String divisionName) {
        tournamentApplicationService.advanceToNextPhase(tournamentId, divisionName);
    }

    @PostMapping("/{tournamentId}/simulate-elimination")
    public void simulateEliminationMatches(
            @PathVariable UUID tournamentId,
            @RequestParam String divisionName) {
        tournamentApplicationService.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
    }

   

    @GetMapping("/{tournamentId}/divisions/{divisionId}/{categoryId}/advancement-status")
    public ResponseEntity<DivisionAdvancementStatus> canAdvanceDivision(
            @PathVariable UUID tournamentId,
            @PathVariable UUID divisionId,
            @PathVariable UUID categoryId) {

        DivisionAdvancementStatus status = tournamentApplicationService.canAdvanceDivision(
                divisionId, tournamentId, categoryId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/{tournamentId}/divisions/{categoryId}/check-out")
    public TournamentStageInfo checkTournamentStage(@PathVariable UUID tournamentId, @PathVariable UUID categoryId) {
        return tournamentApplicationService.checkTournamentStage(tournamentId, categoryId);
    }

    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<List<TournamentInfoRecord>> getTournamentsForCategory(
            @PathVariable UUID categoryId) {

        List<TournamentInfoRecord> tournaments = tournamentApplicationService.getTournamentsForCategory(categoryId);
        return ResponseEntity.ok(tournaments);
    }

    @GetMapping("/{tournamentId}/divisions")
    public ResponseEntity<List<DivisionEntity>> getDivisionsForTournament(
            @PathVariable UUID tournamentId) {
        List<DivisionEntity> divisions = tournamentApplicationService
                .getDivisionsForTournament(tournamentId);
        return ResponseEntity.ok(divisions);
    }

    @PostMapping("/schedule")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Boolean> scheduleMatch(@RequestBody List<WeeklyScheduleRecordRequest> weeklySchedule) {
        Boolean success = tournamentApplicationService.scheduleMatchs(weeklySchedule);
        return ResponseEntity.status(HttpStatus.CREATED).body(success);
    }

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


    @DeleteMapping("/delete-match/{matchId}")
    public void deleteScheduleMatch(@PathVariable UUID matchId) {
        tournamentApplicationService.deleteScheduleMatch(matchId);
    }

    @GetMapping("/existing-match/{matchId}")
    public ResponseEntity<Boolean> existingMatch(@PathVariable UUID matchId) {
        return ResponseEntity.ok(tournamentApplicationService.matchExists(matchId));    
    
    }


    @PutMapping("/update-status-played/{matchId}")
    public Boolean putMethodName(@PathVariable String matchId) {
        return tournamentApplicationService.updateMatchStatus(UUID.fromString(matchId), MatchStatus.JUGADO);
    }



    @DeleteMapping("/delete-all-in-tournament/{tournamentId}")
    public void deleteAllInTournament(@PathVariable UUID tournamentId) {
        tournamentApplicationService.deleteTournament(tournamentId);
    }

    @DeleteMapping("/delete-teams-from-category/{categoryId}")
    public void deleteTeamsFromCategory(@PathVariable UUID categoryId) {
        tournamentApplicationService.deleteTeamsFromCategory(categoryId);
    }

    @GetMapping("/amountTeams/{categoryId}")
    public int getAmountTeams(@PathVariable UUID categoryId) {
        return tournamentApplicationService.getNumberOfTeams(categoryId);
    }
 
}