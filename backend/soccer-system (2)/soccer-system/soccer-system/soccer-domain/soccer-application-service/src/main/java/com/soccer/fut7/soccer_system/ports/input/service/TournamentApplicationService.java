package com.soccer.fut7.soccer_system.ports.input.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;

public interface TournamentApplicationService {
    TournamentInfoRecord initializeTournament(TournamentInfoRecord tournamentInfo);

    void simulateRoundRobinMatches(UUID tournamentId);

    void createTournamentDivisions(UUID tournamentId);

    void advanceToNextPhase(UUID tournamentId, String divisionName);

    void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName);

    List<MatchScheduleInfoRecord> getMatchesInDateRange(LocalDate startDate, LocalDate endDate);

    // New methods
    DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId);

    List<TournamentInfoRecord> getTournamentsForCategory(UUID categoryId);

    TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId);

    List<DivisionEntity> getDivisionsForTournament(UUID tournamentId);

    Boolean scheduleMatchs(List<WeeklyScheduleRecordRequest> matchSchedule);



    void deleteScheduleMatch(UUID matchId);


    Boolean matchExists(UUID matchId);


    Boolean updateMatchStatus(UUID matchId, MatchStatus status);


    void deleteTournament(UUID tournamentId);
    
    void deleteTeamsFromCategory(UUID tournamentId);

 
    int getNumberOfTeams(UUID categoryId);
 
}