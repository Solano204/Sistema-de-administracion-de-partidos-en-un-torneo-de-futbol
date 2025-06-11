package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.mappers.TournamentMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.TourmentRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Lazy
@AllArgsConstructor
public class CommandHelperTournament {

    private final TourmentRepository tournamentRepository;
    private final TournamentMapperDomain tournamentMapper;

    public TournamentInfoRecord initializeTournament(TournamentInfoRecord tournamentInfo) {
        TourmentEntity tournamentEntity = tournamentMapper.tournamentInfoRecordToTournament(tournamentInfo);
        tournamentRepository.initializeTournament(tournamentEntity);
        // Since this is likely a void operation in the repository that triggers a
        // stored procedure,
        // we just return the original data with any generated IDs that might be needed
        return tournamentInfo;
    }

    public void simulateRoundRobinMatches(UUID tournamentId) {
        tournamentRepository.simulateRoundRobinMatches(tournamentId);
    }

    public void createTournamentDivisions(UUID tournamentId) {
        tournamentRepository.createTournamentDivisions(tournamentId);
    }

    public void advanceToNextPhase(UUID tournamentId, String divisionName) {
        tournamentRepository.advanceToNextPhase(tournamentId, divisionName);
    }

    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName) {
        tournamentRepository.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
    }

    public List<MatchScheduleInfoRecord> getMatchesInDateRange(LocalDate startDate, LocalDate endDate) {
        List<MatchScheduleEntity> matches = tournamentRepository.getMatchesInDateRange(startDate, endDate);
        return tournamentMapper.matchScheduleListToMatchScheduleInfoRecordList(matches);
    }

    public DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId) {
        return tournamentRepository.canAdvanceDivision(divisionId, tournamentId, categoryId);
    }

    public List<TournamentInfoRecord> getTournamentsForCategory(UUID categoryId) {
        List<TourmentEntity> tournaments = tournamentRepository.getTournamentsForCategory(categoryId);

        tournaments = tournaments.stream().peek(t -> t.setCategoryId(categoryId)).collect(Collectors.toList());
        return tournaments.stream()
                .map(tournamentMapper::tournamentToTournamentInfoRecord)
                .collect(Collectors.toList());
    }


    public List<DivisionEntity> getDivisionsForTournament(UUID tournamentId) {
        return tournamentRepository.getDivisionsForTournament(tournamentId).stream()
                .collect(Collectors.toList());
    }

    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId) {
        return tournamentRepository.checkTournamentStage(tournamentId, categoryId);
    }

    public Boolean scheduleMatchs(List<WeeklyScheduleRecordRequest> matchSchedule) {
        List<MatchScheduleEntity> matchSchedulEntities = tournamentMapper
                .weeklyScheduleRecordsToEntities(matchSchedule);
        return tournamentRepository.scheduleMatchs(matchSchedulEntities);
    }


    public void deleteScheduleMatch(UUID matchId) {
        tournamentRepository.deleteScheduleMatch(matchId);
    }

    public Boolean matchExists(UUID matchId) {
        return tournamentRepository.matchExists(matchId);
    }

    public Boolean updateMatchStatus(UUID matchId, MatchStatus matchStatus) {
        return tournamentRepository.updateMatchStatus(matchId, matchStatus);
    }

    public void deleteTeamsFromCategory(UUID tournamentId) {
        tournamentRepository.deleteTeamsFromCategory(tournamentId);
    }

    public void deleteTournament(UUID tournamentId) {
        tournamentRepository.deleteTournament(tournamentId);
    }

    public Integer getNumberOfTeams(UUID categoryId) {
        return tournamentRepository.getNumberOfTeams(categoryId);
    }
}