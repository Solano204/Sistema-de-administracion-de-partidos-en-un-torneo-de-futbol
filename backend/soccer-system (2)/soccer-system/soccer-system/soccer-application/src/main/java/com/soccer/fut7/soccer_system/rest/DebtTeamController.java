package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtTeamApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Tag(name = "Team Debts", description = "Debts owed by teams (e.g. tournament fees). Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/debts/teams")
@AllArgsConstructor
@Validated
public class DebtTeamController {

    private final DebtTeamApplicationService debtTeamApplicationService;
      private final TeamApplicationService teamApplicationService;

    @Operation(summary = "Create a team debt")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Debt created"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<DebtRecordDto> insertTeamDebt(
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtTeamApplicationService.insertTeamDebt(debt));
    }

    @Operation(summary = "Mark a team debt paid/unpaid")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "404", description = "No debt exists with that id")
    })
    @PutMapping("/{debtId}/status")
    public ResponseEntity<Boolean> updateTeamDebtStatus(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestParam @NotNull(message = "Status cannot be null") DebtStatus status,
            @RequestParam @NotNull(message = "Paid date cannot be null") LocalDate paidDate) {
        return ResponseEntity.ok(debtTeamApplicationService.updateTeamDebtStatus(debtId, status, paidDate));
    }

    // "/team/{teamId}", not bare "/{teamId}": that collided with PUT/DELETE
    // "/{debtId}" below - same single-segment shape, different param name,
    // which Spectral's path-params rule correctly flags as an ambiguous
    // OpenAPI path.
    @Operation(summary = "List every debt for a team")
    @ApiResponse(responseCode = "200", description = "Debts returned (possibly empty)")
    @GetMapping("/team/{teamId}")
    public ResponseEntity<Set<DebtRecordDto>> getAllTeamDebts(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId) {
        return ResponseEntity.ok(debtTeamApplicationService.getAllTeamDebts(teamId));
    }

    @Operation(summary = "Delete a team's debt for a given due date")
    @ApiResponse(responseCode = "204", description = "Debt deleted")
    @DeleteMapping("/{teamId}/date")
    public ResponseEntity<Void> deleteTeamDebtByDate(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId,
            @RequestParam @NotNull(message = "Due date cannot be null") LocalDate dueDate) {
        debtTeamApplicationService.deleteTeamDebtByDate(teamId, dueDate);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete every debt for a team")
    @ApiResponse(responseCode = "204", description = "Debts deleted")
    @DeleteMapping("/{teamId}/all")
    public ResponseEntity<Void> deleteAllTeamDebts(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId) {
        debtTeamApplicationService.deleteAllTeamDebts(teamId);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Delete a team debt by id")
    @ApiResponse(responseCode = "204", description = "Debt deleted")
    @DeleteMapping("/{debtId}")
    public ResponseEntity<Void> deleteTeamDebtById(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId) {
        debtTeamApplicationService.deleteTeamDebtById(debtId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a team debt")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Debt updated"),
        @ApiResponse(responseCode = "404", description = "No debt exists with that id")
    })
    @PutMapping("/{debtId}")
    public ResponseEntity<DebtRecordDto> updateTeamDebt(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtTeamApplicationService.updateTeamDebt(debtId, debt));
    }


    @Operation(summary = "Search teams by name")
    @ApiResponse(responseCode = "200", description = "Teams returned (possibly empty)")
     @GetMapping("/get-teams-by-name")
    public List<TeamNameIdRecord> getTeamsByName(@RequestParam String teamName) {
        return teamApplicationService.getTeamsByName(teamName);
    }
}
