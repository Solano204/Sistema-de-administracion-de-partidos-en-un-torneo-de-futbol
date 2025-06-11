package com.soccer.fut7.soccer_system.team.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.ports.outport.TourmentRepository;
import com.soccer.fut7.soccer_system.team.entitiy.DivisionEntityJpa;
import com.soccer.fut7.soccer_system.team.entitiy.MatchSchedule;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import com.soccer.fut7.soccer_system.team.helpers.TournamentCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.TournamentMapper;

@Component
@RequiredArgsConstructor
@Lazy
@Slf4j
public class TournamentAdapter implements TourmentRepository {

    private final TournamentCommandHelperRepository tournamentCommandHelperRepository;
    private final TournamentMapper tournamentMapper;


    @Override
    public void initializeTournament(TourmentEntity request) {
        TournamentEntity tournamentEntity = tournamentMapper.toEntity(request);
        tournamentCommandHelperRepository.initializeTournament(tournamentEntity);
    }

    @Override
    public void simulateRoundRobinMatches(UUID tournamentId) {
        tournamentCommandHelperRepository.simulateRoundRobinMatches(tournamentId);
    }

    @Override
    public void createTournamentDivisions(UUID tournamentId) {
        tournamentCommandHelperRepository.createTournamentDivisions(tournamentId);
    }

    @Override
    public void advanceToNextPhase(UUID tournamentId, String divisionName) {
        tournamentCommandHelperRepository.advanceToNextPhase(tournamentId, divisionName);
    }

    @Override
    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName) {
        tournamentCommandHelperRepository.simulateEliminationMatchesByDivisionName(tournamentId, divisionName);
    }

    @Override
    public List<MatchScheduleEntity> getMatchesInDateRange(LocalDate startDate, LocalDate endDate) {
        return      tournamentCommandHelperRepository.getMatchesInDateRange(startDate, endDate).stream()
                .map(tournamentMapper::toMatchScheduleDomain)
                .collect(Collectors.toList());
    }

    @Override
    public DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId) {
        return tournamentCommandHelperRepository.canAdvanceDivision(divisionId, tournamentId, categoryId);
    }

    @Override
    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId) {
        return tournamentCommandHelperRepository.checkTournamentStage(tournamentId, categoryId);
    }

    @Override
    public List<TourmentEntity> getTournamentsForCategory(UUID categoryId) {
        return tournamentCommandHelperRepository.getTournamentsForCategory(categoryId).stream()
                .map(tournamentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<DivisionEntity> getDivisionsForTournament(UUID tournamentId) {
        return tournamentCommandHelperRepository.getDivisionsForTournament(tournamentId).stream()
                .map(tournamentMapper::toDivisionDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Boolean scheduleMatchs(List<MatchScheduleEntity> matchSchedule) {
        List<MatchSchedule> entity = tournamentMapper.toEntityJpaList(matchSchedule);
        Boolean isSuccess = tournamentCommandHelperRepository.saveMatchSchedule(entity);
        return isSuccess;
    }

    @Override
    public void deleteScheduleMatch(UUID matchId) {
        
        tournamentCommandHelperRepository.deleteScheduleMatch(matchId);
    }

    @Override
    public Boolean matchExists(UUID matchId) {
        return tournamentCommandHelperRepository.matchExists(matchId);
    }

    @Override
    public Boolean updateMatchStatus(UUID matchId, MatchStatus matchStatus) {
        return tournamentCommandHelperRepository.updateMatchStatus(matchId, matchStatus);
    }

    @Override
    public void deleteTeamsFromCategory(UUID tournamentId) {
        tournamentCommandHelperRepository.deleteTeamsFromCategory(tournamentId);
    }

    @Override
    public void deleteTournament(UUID tournamentId) {
        tournamentCommandHelperRepository.deleteTournament(tournamentId);
    }

    @Override
    public Integer getNumberOfTeams(UUID categoryId) {
        return tournamentCommandHelperRepository.getNumberOfTeamsInCategory(categoryId);
    }
}