package com.soccer.fut7.soccer_system.team.helpers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.ExceptionApplication.TournamentException;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatus;
import com.soccer.fut7.soccer_system.dto.tourment.DivisionAdvancementStatusRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentStageInfo;
import com.soccer.fut7.soccer_system.team.entitiy.DivisionEntityJpa;
import com.soccer.fut7.soccer_system.team.entitiy.MatchSchedule;
import com.soccer.fut7.soccer_system.team.repository.DivisionRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.MatchScheduleRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TournamentRepositoryData;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

@Component
@Lazy
@RequiredArgsConstructor
public class TournamentCommandHelperRepository {

    private final TournamentRepositoryData tournamentRepositoryData;
    private final DivisionRepositoryData divisionRepositoryData;
    private final MatchScheduleRepositoryData matchScheduleRepositoryData;
    private final TeamRepositoryData teamRepositoryData;
    private final JdbcTemplate jdbcTemplate;
    private final TeamRepositoryData teamRepository;

    public List<TournamentEntity> getAllTournaments() {
        return tournamentRepositoryData.findAll();
    }

    public void initializeTournament(TournamentEntity tournamentEntity) {
        // TournamentEntity savedTournament =
        // tournamentRepositoryData.save(tournamentEntity);

        // Call stored procedure to initialize tournament roll
        tournamentRepositoryData.initializeTournamentRoll(
                tournamentEntity.getTournamentName(),
                tournamentEntity.getCategory().getCategoryName(),
                tournamentEntity.getStartDate(),
                tournamentEntity.getEndDate());
    }

    public void simulateRoundRobinMatches(UUID tournamentId) {
        tournamentRepositoryData.simulateRoundRobinMatches(tournamentId);
    }

    public void createTournamentDivisions(UUID tournamentId) {
        tournamentRepositoryData.createTournamentDivisions(tournamentId);
    }

    public void advanceToNextPhase(UUID tournamentId, String divisionName) {
        tournamentRepositoryData.advanceToNextPhase(tournamentId, divisionName);
    }

    public void simulateEliminationMatchesByDivisionName(UUID tournamentId, String divisionName) {
        Optional<DivisionEntityJpa> division = divisionRepositoryData.findByTournamentAndDivision(tournamentId,
                divisionName);

        if (division.isPresent()) {
            tournamentRepositoryData.simulateEliminationMatches(tournamentId, division.get().getId());
        } else {
            throw new RuntimeException(
                    "Division not found with name: " + divisionName + " for tournament: " + tournamentId);
        }
    }

    public List<MatchSchedule> getMatchesInDateRange(LocalDate startDate, LocalDate endDate) {
        return matchScheduleRepositoryData.getMatchesInDateRange(startDate, endDate);
    }

    public TournamentStageInfo checkTournamentStage(UUID tournamentId, UUID categoryId) {
        Map<String, Object> result = tournamentRepositoryData.checkTournamentStage(tournamentId, categoryId);

        return new TournamentStageInfo(
                (String) result.get("current_stage"),
                (boolean) result.get("can_create_divisions"),
                (int) result.get("recommended_divisions"),
                (int) result.get("total_teams"),
                (int) result.get("completed_matches"),
                (int) result.get("total_matches"));
    }

    public DivisionAdvancementStatus canAdvanceDivision(UUID divisionId, UUID tournamentId, UUID categoryId) {
        Map<String, Object> result = tournamentRepositoryData.checkDivisionAdvancement(divisionId, tournamentId,
                categoryId);

        return new DivisionAdvancementStatus(
                (boolean) result.get("can_advance"),
                (String) result.get("current_phase"),
                (String) result.get("next_phase"),
                (int) result.get("completed_matches"),
                (int) result.get("total_matches"),
                (int) result.get("teams_ready"),
                (int) result.get("total_teams"),
                (String) result.get("division_name"));
    }


    public List<TournamentEntity> getTournamentsForCategory(UUID categoryId) {
        return tournamentRepositoryData.findByCategoryId(categoryId);
    }

    public List<DivisionEntityJpa> getDivisionsForTournament(UUID tournamentId) {
        return divisionRepositoryData.findByTournamentId(tournamentId);
    }

    public Boolean saveMatchSchedule(List<MatchSchedule> matchScheduleList) {
        for (MatchSchedule matchSchedule : matchScheduleList) {
            // If no ID is provided, generate one
            if (matchSchedule.getId() == null) {
                matchSchedule.setId(UUID.randomUUID());
            }

            // Set default status if not provided
            if (matchSchedule.getStatus() == null || matchSchedule.getStatus().isEmpty()) {
                matchSchedule.setStatus("PENDIENTE");
            }
        }

        int size = matchScheduleRepositoryData.saveAll(matchScheduleList).size();
        return size > 0 ? true : false;
    }


    public void deleteScheduleMatch(UUID matchId) {
        matchScheduleRepositoryData.deleteByMatchId(matchId);
    }

    public boolean matchExists(UUID matchId) {
         if (matchScheduleRepositoryData.existingMatchSchedule(matchId) == null) return false; 
         return  true;
    }


public Boolean updateMatchStatus(UUID matchId, MatchStatus status) {
    String state = status.name();
    return ( matchScheduleRepositoryData.updateMatchStatus(matchId, state)) ==  1 ? true : false;
}

  public void deleteTournament(UUID tournamentId) {
        tournamentRepositoryData.deleteTournamentData(tournamentId);
    }

    public void deleteTeamsFromCategory(UUID tournamentId) {
        tournamentRepositoryData.deleteCategoryTeams(tournamentId);
    }

    public int getNumberOfTeamsInCategory(UUID categoryId) {
        return teamRepositoryData.countByCategoryId(categoryId);
    }
}