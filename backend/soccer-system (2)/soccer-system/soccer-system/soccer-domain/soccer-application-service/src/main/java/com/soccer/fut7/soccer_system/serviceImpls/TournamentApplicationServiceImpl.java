package com.soccer.fut7.soccer_system.serviceImpls;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.ports.input.service.TournamentApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerTournament;

import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Lazy
public class TournamentApplicationServiceImpl implements TournamentApplicationService {

    private final CommandHandlerTournament commandHandlerTournament;

    @Override
    public TournamentInfoRecord initializeTournament(TournamentInfoRecord tournamentInfo) {
        return commandHandlerTournament.initializeTournament(tournamentInfo);
    }

    @Override
    public void simulateRoundRobinMatches(UUID tournamentId) {
        commandHandlerTournament.simulateRoundRobinMatches(tournamentId);
    }

    @Override
    public void createTournamentDivisions(UUID tournamentId) {
        commandHandlerTournament.createTournamentDivisions(tournamentId);
    }

    @Override
    public void advanceToNextPhase(UUID tournamentId, String divisionName) {
        commandHandlerTournament.advanceToNextPhase(tournamentId, divisionName);
    }

    @Override
    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName) {
        commandHandlerTournament.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
    }

    @Override
    public List<MatchScheduleInfoRecord> getMatchesInDateRange(LocalDate startDate, LocalDate endDate) {
        return commandHandlerTournament.getMatchesInDateRange(startDate, endDate);
    }

    @Override
    public DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId) {
        return commandHandlerTournament.canAdvanceDivision(divisionId, tournamentId, categoryId);
    }

    @Override
    public List<TournamentInfoRecord> getTournamentsForCategory(UUID categoryId) {
        return commandHandlerTournament.getTournamentsForCategory(categoryId);
    }

    @Override
    public List<DivisionEntity> getDivisionsForTournament(UUID tournamentId) {
        return commandHandlerTournament.getDivisionsForTournament(tournamentId);
    }

    @Override
    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId) {
        return commandHandlerTournament.checkTournamentStage(tournamentId, categoryId);
    }

    @Override

    public Boolean scheduleMatchs(List<WeeklyScheduleRecordRequest> matchSchedule) {

        return commandHandlerTournament.scheduleMatchs(matchSchedule);
    }


    @Override
    public void deleteScheduleMatch(UUID matchId) {
        commandHandlerTournament.deleteScheduleMatch(matchId);
    }

    @Override
    public Boolean matchExists(UUID matchId) {
        return commandHandlerTournament.matchExists(matchId);
    }

    @Override
    public Boolean updateMatchStatus(UUID matchId, MatchStatus status) {
        return commandHandlerTournament.updateMatchStatus(matchId, status);
    }

    @Override
    public void deleteTournament(UUID tournamentId) {
        // TODO Auto-generated method stub
        commandHandlerTournament.deleteTournament(tournamentId);
    }

    @Override
    public void deleteTeamsFromCategory(UUID tournamentId) {
       
        commandHandlerTournament.deleteTeamsFromCategory(tournamentId);
    }

    @Override
    public int getNumberOfTeams(UUID categoryId) {
        return commandHandlerTournament.getNumberOfTeams(categoryId);
    }


    
}