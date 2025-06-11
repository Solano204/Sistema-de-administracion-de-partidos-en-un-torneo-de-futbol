package com.soccer.fut7.soccer_system.ports.outport;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;

public interface TourmentRepository {
    public void initializeTournament(TourmentEntity request);

    public void simulateRoundRobinMatches(UUID tournamentId);

    public void createTournamentDivisions(UUID tournamentId);

    public void advanceToNextPhase(UUID tournamentId, String divisionName);

    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName);

    public List<MatchScheduleEntity> getMatchesInDateRange(LocalDate startDate, LocalDate endDate);

    // New method
    DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId);

    // Additional methods for tournament queries
    List<TourmentEntity> getTournamentsForCategory(UUID categoryId);

    List<DivisionEntity> getDivisionsForTournament(UUID tournamentId);

    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId);

    Boolean scheduleMatchs(List<MatchScheduleEntity> matchSchedule);

    void deleteScheduleMatch(UUID matchId);

    Boolean matchExists(UUID matchId);


    Boolean updateMatchStatus(UUID matchId, MatchStatus matchStatus);

    void deleteTeamsFromCategory(UUID tournamentId);

    void deleteTournament(UUID tournamentId);

    Integer getNumberOfTeams(UUID categoryId);
}
