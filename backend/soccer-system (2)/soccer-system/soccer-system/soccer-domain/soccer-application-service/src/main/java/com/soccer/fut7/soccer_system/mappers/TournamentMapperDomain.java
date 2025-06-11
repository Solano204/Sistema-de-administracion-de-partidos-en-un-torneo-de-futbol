package com.soccer.fut7.soccer_system.mappers;

import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TournamentMapperDomain {


      public TeamNameIdRecord teamToTeamNameIdRecord(Team match) {
        if (match == null)
            return null;

        return new TeamNameIdRecord(match.getId(), match.getName().value());
    }

    public List<TeamNameIdRecord> teamsToTeamNameIdRecords(List<Team> teams) {
        if (teams == null)
            return null;

        return teams.stream()
                .map(this::teamToTeamNameIdRecord)
                .collect(Collectors.toList());
    }
    public TourmentEntity tournamentInfoRecordToTournament(TournamentInfoRecord record) {
        if (record == null) {
            return null;
        }

        TourmentEntity entity = new TourmentEntity();
        entity.setId(record.id());
        entity.setTournamentName(record.tournamentName());
        entity.setCategoryName(record.categoryName());
        entity.setStartDate(record.startDate());
        entity.setEndDate(record.endDate());

        return entity;
    }

    public TournamentInfoRecord tournamentToTournamentInfoRecord(TourmentEntity entity) {
        if (entity == null) {
            return null;
        }

        return new TournamentInfoRecord(
                entity.getId(),
                entity.getTournamentName(),
                entity.getCategoryId(),
                entity.getCategoryName(),
                entity.getStartDate(),
                entity.getEndDate(), 
                entity.getPhase());
    }

    public MatchScheduleInfoRecord matchScheduleToMatchScheduleInfoRecord(MatchScheduleEntity entity) {
        if (entity == null) {
            return null;
        }

        return new MatchScheduleInfoRecord(
                entity.getId(),
                entity.getMatchId(),
                entity.getTournamentId(),
                // entity.getJourneyId(),
                entity.getMatchDay(),
                entity.getMatchDate(),
                entity.getMatchTime(),
                // entity.getHomeTeamId(),
                // entity.getAwayTeamId(),
                entity.getHomeTeamName(),
                entity.getAwayTeamName(),
                entity.getTournamentName(),
                // entity.getCategoryId(),
                entity.getCategoryName(),
                entity.getPhase(),
                entity.getStatus()
                // entity.getDivisionName()
                );
    }

    public List<MatchScheduleInfoRecord> matchScheduleListToMatchScheduleInfoRecordList(
            List<MatchScheduleEntity> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(this::matchScheduleToMatchScheduleInfoRecord)
                .collect(Collectors.toList());
    }

    public MatchScheduleEntity weeklyScheduleRecordToMatchSchedule(WeeklyScheduleRecordRequest record) {
        if (record == null) {
            return null;
        }

        MatchScheduleEntity entity = new MatchScheduleEntity();
        entity.setId(record.id());
        entity.setMatchId(record.matchId());
        entity.setTournamentId(record.tournamentId());
        // entity.setJourneyId(record.journeyId());
        entity.setMatchDay(record.matchDay());
        entity.setMatchDate(record.matchDate());
        entity.setMatchTime(record.matchTime());
        entity.setHomeTeamName(record.homeTeamName());
        entity.setAwayTeamName(record.awayTeamName());
        entity.setTournamentName(record.tournamentName());
        // entity.setCategoryId(record.categoryId());
        entity.setCategoryName(record.categoryName());
        entity.setPhase(record.phase());
        entity.setStatus(record.status() != null ? record.status() : "PENDIENTE");
        // entity.setDivisionName(record.divisionName());

        return entity;
    }

    public WeeklyScheduleRecordRequest matchScheduleToWeeklyScheduleRecord(MatchScheduleEntity entity) {
        if (entity == null) {
            return null;
        }

        return new WeeklyScheduleRecordRequest(
                entity.getId(),
                entity.getMatchId(),
                entity.getTournamentId(),
                // entity.getJourneyId(),
                entity.getMatchDay(),
                entity.getMatchDate(),
                entity.getMatchTime(),
                entity.getHomeTeamName(),
                entity.getAwayTeamName(),
                entity.getTournamentName(),
                // entity.getCategoryId(),
                entity.getCategoryName(),
                entity.getPhase(),
                entity.getStatus()
                // entity.getDivisionName()
                );
    }

    public List<MatchScheduleEntity> weeklyScheduleRecordsToEntities(List<WeeklyScheduleRecordRequest> records) {
        if (records == null || records.isEmpty()) {
            return List.of();
        }

        return records.stream()
                .map(this::weeklyScheduleRecordToMatchSchedule)
                .collect(Collectors.toList());
    }

    public List<WeeklyScheduleRecordRequest> entitiesToWeeklyScheduleRecords(List<MatchScheduleEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }

        return entities.stream()
                .map(this::matchScheduleToWeeklyScheduleRecord)
                .collect(Collectors.toList());
    }

}