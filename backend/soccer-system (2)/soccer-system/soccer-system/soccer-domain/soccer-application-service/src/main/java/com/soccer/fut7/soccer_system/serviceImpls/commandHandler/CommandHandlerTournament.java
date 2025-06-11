package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionSystemException;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.ExceptionApplication.TournamentException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperTournament;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@Lazy
@AllArgsConstructor
public class CommandHandlerTournament {
//#endregion

    private final CommandHelperTournament commandHelperTournament;

    public TournamentInfoRecord initializeTournament(TournamentInfoRecord tournamentInfo) {
        try {
            return commandHelperTournament.initializeTournament(tournamentInfo);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while initializing tournament: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while initializing tournament: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error initializing tournament: " + e.getMessage());
        }
    }

    public void simulateRoundRobinMatches(UUID tournamentId) {
        try {
            commandHelperTournament.simulateRoundRobinMatches(tournamentId);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Cannot simulate matches - database integrity violation: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while simulating matches: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error simulating matches: " + e.getMessage());
        }
    }

    public void createTournamentDivisions(UUID tournamentId) {
        try {
            commandHelperTournament.createTournamentDivisions(tournamentId);
        } catch (DataIntegrityViolationException e) {
            // Specific handling for foreign key violation
            if (e.getMessage().contains("journeys_tournament_id_fkey")) {
                throw new TournamentException("Cannot create divisions - tournament with ID " + tournamentId + " does not exist");
            }
            throw new TournamentException("Database integrity violation while creating divisions: " + e.getMostSpecificCause().getMessage());
        } catch (TransactionSystemException e) {
            throw new TournamentException("Transaction error while creating divisions: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while creating divisions: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error creating divisions: " + e.getMessage());
        }
    }

    public void advanceToNextPhase(UUID tournamentId, String divisionName) {
        try {
            commandHelperTournament.advanceToNextPhase(tournamentId, divisionName);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while advancing phase: " + e.getMostSpecificCause().getMessage());
        } catch (TransactionSystemException e) {
            // Handle stored procedure errors specifically
            if (e.getMostSpecificCause().getMessage().contains("No es posible avanzar")) {
                throw new TournamentException("Cannot advance to next phase: Not all matches are completed");
            }
            throw new TournamentException("Transaction error while advancing phase: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while advancing phase: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error advancing phase: " + e.getMessage());
        }
    }

    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName) {
        try {
            commandHelperTournament.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while simulating elimination matches: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while simulating elimination matches: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error simulating elimination matches: " + e.getMessage());
        }
    }

    public List<MatchScheduleInfoRecord> getMatchesInDateRange(LocalDate startDate, LocalDate endDate) {
        try {
            return commandHelperTournament.getMatchesInDateRange(startDate, endDate);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while fetching matches: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error fetching matches: " + e.getMessage());
        }
    }

    public DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId) {
        try {
            return commandHelperTournament.canAdvanceDivision(divisionId, tournamentId, categoryId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while checking advancement status: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error checking advancement status: " + e.getMessage());
        }
    }

    public List<TournamentInfoRecord> getTournamentsForCategory(UUID categoryId) {
        try {
            return commandHelperTournament.getTournamentsForCategory(categoryId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while fetching tournaments: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error fetching tournaments: " + e.getMessage());
        }
    }

    public List<DivisionEntity> getDivisionsForTournament(UUID tournamentId) {
        try {
            return commandHelperTournament.getDivisionsForTournament(tournamentId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while fetching divisions: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error fetching divisions: " + e.getMessage());
        }
    }

    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId) {
        try {
            return commandHelperTournament.checkTournamentStage(tournamentId, categoryId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while checking tournament stage: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error checking tournament stage: " + e.getMessage());
        }
    }

    public Boolean scheduleMatchs(List<WeeklyScheduleRecordRequest> matchSchedule) {
        try {
            return commandHelperTournament.scheduleMatchs(matchSchedule);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while scheduling matches: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while scheduling matches: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error scheduling matches: " + e.getMessage());
        }
    }

    public void deleteScheduleMatch(UUID matchId) {
        try {
            commandHelperTournament.deleteScheduleMatch(matchId);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while deleting match: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while deleting match: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error deleting match: " + e.getMessage());
        }
    }

    public Boolean matchExists(UUID matchId) {
        try {
            return commandHelperTournament.matchExists(matchId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while checking match existence: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error checking match existence: " + e.getMessage());
        }
    }

    public Boolean updateMatchStatus(UUID matchId, MatchStatus matchStatus) {
        try {
            return commandHelperTournament.updateMatchStatus(matchId, matchStatus);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while updating match status: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while updating match status: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error updating match status: " + e.getMessage());
        }
    }


    public void deleteTeamsFromCategory(UUID tournamentId) {
        try {
            commandHelperTournament.deleteTeamsFromCategory(tournamentId);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while deleting teams from category: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while deleting teams from category: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error deleting teams from category: " + e.getMessage());
        }
    }

    public void deleteTournament(UUID tournamentId) {
        try {
            commandHelperTournament.deleteTournament(tournamentId);
        } catch (DataIntegrityViolationException e) {
            throw new TournamentException("Database integrity violation while deleting tournament: " + e.getMostSpecificCause().getMessage());
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while deleting tournament: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error deleting tournament: " + e.getMessage());
        }
    }

    public int getNumberOfTeams(UUID tournamentId) {
        try {
            return commandHelperTournament.getNumberOfTeams(tournamentId);
        } catch (DataAccessException e) {
            throw new TournamentException("Data access error while getting number of teams: " + e.getMessage());
        } catch (Exception e) {
            throw new TournamentException("Unexpected error getting number of teams: " + e.getMessage());
        }
    }
}