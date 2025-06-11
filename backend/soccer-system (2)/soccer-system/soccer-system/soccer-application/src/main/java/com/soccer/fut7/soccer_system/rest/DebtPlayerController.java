package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtPlayerApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/debts/players")
@AllArgsConstructor
@Validated
public class DebtPlayerController {
    
    private final DebtPlayerApplicationService debtPlayerApplicationService;
    private PlayerApplicationService playerApplicationService;

    
    @PostMapping
    public ResponseEntity<DebtRecordDto> insertPlayerDebt(
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtPlayerApplicationService.insertPlayerDebt(debt));
    }
    
    @PutMapping("/{debtId}/status")
    public ResponseEntity<Boolean> updatePlayerDebtStatus(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId, 
            @RequestParam @NotNull(message = "Status cannot be null") DebtStatus status, 
            @RequestParam @NotNull(message = "Paid date cannot be null") LocalDate paidDate) {
        return ResponseEntity.ok(debtPlayerApplicationService.updatePlayerDebtStatus(debtId, status, paidDate));
    }
    
    @GetMapping("/{playerId}")
    public ResponseEntity<Set<DebtRecordDto>> getAllPlayerDebts(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId) {
        return ResponseEntity.ok(debtPlayerApplicationService.getAllPlayerDebts(playerId));
    }
    
    @DeleteMapping("/{playerId}/date")
    public ResponseEntity<Void> deletePlayerDebtByDate(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId, 
            @RequestParam @NotNull(message = "Due date cannot be null") LocalDate dueDate) {
        debtPlayerApplicationService.deletePlayerDebtByDate(playerId, dueDate);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{playerId}/all")
    public ResponseEntity<Void> deleteAllPlayerDebts(
            @PathVariable @NotNull(message = "Player ID cannot be null") UUID playerId) {
        debtPlayerApplicationService.deleteAllPlayerDebts(playerId);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{debtId}")
    public ResponseEntity<Void> deletePlayerDebtById(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId) {
        debtPlayerApplicationService.deletePlayerDebtById(debtId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{debtId}")
    public ResponseEntity<DebtRecordDto> updatePlayerDebt(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtPlayerApplicationService.updatePlayerDebt(debtId, debt));
    }

     @GetMapping("/get-players-by-name")
    public List<PlayerSummaryRecord> getPlayersByName(@RequestParam String playerName) {
        return playerApplicationService.getPlayersByName(playerName).stream().toList();
    }

}