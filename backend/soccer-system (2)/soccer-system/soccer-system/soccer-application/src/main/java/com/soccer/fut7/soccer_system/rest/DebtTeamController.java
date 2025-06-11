package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtTeamApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
@RequestMapping("/debts/teams")
@AllArgsConstructor
@Validated
public class DebtTeamController {
    
    private final DebtTeamApplicationService debtTeamApplicationService;
      private final TeamApplicationService teamApplicationService;
    @PostMapping
    public ResponseEntity<DebtRecordDto> insertTeamDebt(
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtTeamApplicationService.insertTeamDebt(debt));
    }
    
    @PutMapping("/{debtId}/status")
    public ResponseEntity<Boolean> updateTeamDebtStatus(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId, 
            @RequestParam @NotNull(message = "Status cannot be null") DebtStatus status, 
            @RequestParam @NotNull(message = "Paid date cannot be null") LocalDate paidDate) {
        return ResponseEntity.ok(debtTeamApplicationService.updateTeamDebtStatus(debtId, status, paidDate));
    }
    
    @GetMapping("/{teamId}")
    public ResponseEntity<Set<DebtRecordDto>> getAllTeamDebts(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId) {
        return ResponseEntity.ok(debtTeamApplicationService.getAllTeamDebts(teamId));
    }
    
    @DeleteMapping("/{teamId}/date")
    public ResponseEntity<Void> deleteTeamDebtByDate(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId, 
            @RequestParam @NotNull(message = "Due date cannot be null") LocalDate dueDate) {
        debtTeamApplicationService.deleteTeamDebtByDate(teamId, dueDate);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{teamId}/all")
    public ResponseEntity<Void> deleteAllTeamDebts(
            @PathVariable @NotNull(message = "Team ID cannot be null") UUID teamId) {
        debtTeamApplicationService.deleteAllTeamDebts(teamId);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{debtId}")
    public ResponseEntity<Void> deleteTeamDebtById(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId) {
        debtTeamApplicationService.deleteTeamDebtById(debtId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{debtId}")
    public ResponseEntity<DebtRecordDto> updateTeamDebt(
            @PathVariable @NotNull(message = "Debt ID cannot be null") UUID debtId,
            @RequestBody @Valid DebtRecordDto debt) {
        return ResponseEntity.ok(debtTeamApplicationService.updateTeamDebt(debtId, debt));
    }


     @GetMapping("/get-teams-by-name")
    public List<TeamNameIdRecord> getTeamsByName(@RequestParam String teamName) {
        return teamApplicationService.getTeamsByName(teamName);
    }
}