package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtPlayerApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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

@Tag(name = "Player Debts", description = "Debts owed by individual players (e.g. registration fees). Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/debts/players")
@AllArgsConstructor
@Validated
public class DebtPlayerController {

    private final DebtPlayerApplicationService debtPlayerApplicationService;
    private PlayerApplicationService playerApplicationService;

    @Operation(summary = "Create a player debt")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Debt created"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<DebtRecordDto> insertPlayerDebt(
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtPlayerApplicationService.insertPlayerDebt(debt));
    }

    @Operation(summary = "Mark a player debt paid/unpaid")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "404", description = "No debt exists with that id")
    })
    @PutMapping("/{debtId}/status")
    public ResponseEntity<Boolean> updatePlayerDebtStatus(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestParam @NotNull(message = "Status cannot be null") DebtStatus status,
            @RequestParam @NotNull(message = "Paid date cannot be null") LocalDate paidDate) {
        return ResponseEntity.ok(debtPlayerApplicationService.updatePlayerDebtStatus(debtId, status, paidDate));
    }

    // "/player/{playerId}", not bare "/{playerId}": that collided with
    // PUT/DELETE "/{debtId}" below - same single-segment shape, different
    // param name, which Spectral's path-params rule correctly flags as an
    // ambiguous OpenAPI path.
    @Operation(summary = "List every debt for a player")
    @ApiResponse(responseCode = "200", description = "Debts returned (possibly empty)")
    @GetMapping("/player/{playerId}")
    public ResponseEntity<Set<DebtRecordDto>> getAllPlayerDebts(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId) {
        return ResponseEntity.ok(debtPlayerApplicationService.getAllPlayerDebts(playerId));
    }

    @Operation(summary = "Delete a player's debt for a given due date")
    @ApiResponse(responseCode = "204", description = "Debt deleted")
    @DeleteMapping("/{playerId}/date")
    public ResponseEntity<Void> deletePlayerDebtByDate(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId,
            @RequestParam @NotNull(message = "Due date cannot be null") LocalDate dueDate) {
        debtPlayerApplicationService.deletePlayerDebtByDate(playerId, dueDate);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete every debt for a player")
    @ApiResponse(responseCode = "204", description = "Debts deleted")
    @DeleteMapping("/{playerId}/all")
    public ResponseEntity<Void> deleteAllPlayerDebts(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId) {
        debtPlayerApplicationService.deleteAllPlayerDebts(playerId);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "Delete a player debt by id")
    @ApiResponse(responseCode = "204", description = "Debt deleted")
    @DeleteMapping("/{debtId}")
    public ResponseEntity<Void> deletePlayerDebtById(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId) {
        debtPlayerApplicationService.deletePlayerDebtById(debtId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a player debt")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Debt updated"),
        @ApiResponse(responseCode = "404", description = "No debt exists with that id")
    })
    @PutMapping("/{debtId}")
    public ResponseEntity<DebtRecordDto> updatePlayerDebt(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtPlayerApplicationService.updatePlayerDebt(debtId, debt));
    }

    @Operation(summary = "Search players by name")
    @ApiResponse(responseCode = "200", description = "Players returned (possibly empty)")
     @GetMapping("/get-players-by-name")
    public List<PlayerSummaryRecord> getPlayersByName(@RequestParam String playerName) {
        return playerApplicationService.getPlayersByName(playerName).stream().toList();
    }

}
