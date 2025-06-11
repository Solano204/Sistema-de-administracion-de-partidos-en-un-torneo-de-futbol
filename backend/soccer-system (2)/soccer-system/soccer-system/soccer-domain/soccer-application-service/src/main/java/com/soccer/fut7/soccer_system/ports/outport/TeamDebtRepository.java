package com.soccer.fut7.soccer_system.ports.outport;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;

@Repository
public interface TeamDebtRepository {
     // Insert a new team debt
     Optional<TeamDebt> insertTeamDebt(TeamDebt debt);

     // Update team debt status and paid date
     Optional<Boolean> updateTeamDebtStatus(UUID debtId, DebtStatus status, LocalDate paidDate);
 
     // Get all debts for a team
     Optional<List<TeamDebt>> getAllTeamDebts(UUID teamId);
 
     // Delete a specific team debt by date
     void deleteTeamDebtByDate(UUID teamId, LocalDate dueDate);
 
     // Delete all debts for a team
     void deleteAllTeamDebts(UUID teamId);

     void deleteTeamDebtById(UUID debtId);
    
     // Update a team debt
     Optional<TeamDebt> updateTeamDebt(UUID debtId, TeamDebt debt);
}