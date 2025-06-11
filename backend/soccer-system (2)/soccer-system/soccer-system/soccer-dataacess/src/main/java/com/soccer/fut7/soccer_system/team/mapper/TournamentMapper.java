package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.MatchSchedule;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.DivisionEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.DivisionEntityJpa;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class TournamentMapper {

    private final CategoryMapper categoryMapper;

    @Autowired
    public TournamentMapper(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public TourmentEntity toDomain(TournamentEntity entity) {
        TourmentEntity domain = new TourmentEntity();
        domain.setId(entity.getId());
        domain.setPhase(entity.getCurrentPhase());
        domain.setTournamentName(entity.getTournamentName());
        domain.setCategoryName(entity.getCategory().getCategoryName());
        domain.setStartDate(entity.getStartDate());
        domain.setEndDate(entity.getEndDate());
        return domain;
    }

    public TournamentEntity toEntity(TourmentEntity domain) {
        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setCategoryName(domain.getCategoryName());

        return TournamentEntity.builder()
                .id(domain.getId() != null ? domain.getId() : UUID.randomUUID())
                .tournamentName(domain.getTournamentName())
                .category(categoryEntity)
                .startDate(domain.getStartDate())
                .endDate(domain.getEndDate())
                .currentPhase("ROUND_ROBIN")
                .status("ACTIVO")
                .build();
    }

    public MatchScheduleEntity toMatchScheduleDomain(MatchSchedule entity) {
        MatchScheduleEntity domain = new MatchScheduleEntity();
        domain.setId(entity.getId());
        domain.setMatchId(entity.getMatchId());
        domain.setTournamentId(entity.getTournamentId());
        // domain.setJourneyId(entity.getJourneyId());
        domain.setMatchDay(entity.getMatchDay());
        domain.setMatchDate(entity.getMatchDate());
        domain.setMatchTime(entity.getMatchTime());
        // domain.setHomeTeamId(entity.getHomeTeamId());
        // domain.setAwayTeamId(entity.getAwayTeamId());
        domain.setHomeTeamName(entity.getHomeTeamName());
        domain.setAwayTeamName(entity.getAwayTeamName());
        domain.setTournamentName(entity.getTournamentName());
        // domain.setCategoryId(entity.getCategoryId());
        domain.setCategoryName(entity.getCategoryName());
        domain.setPhase(entity.getPhase());
        domain.setStatus(entity.getStatus());
        // domain.setDivisionName(entity.getDivisionName());
        return domain;
    }

    public DivisionEntity toDivisionDomain(DivisionEntityJpa entity) {
        DivisionEntity domain = new DivisionEntity();
        domain.setId(entity.getId());
        domain.setTournamentId(entity.getTournament().getId());
        domain.setDivisionName(entity.getDivisionName());
        domain.setCurrentPhase(entity.getCurrentPhase());
        domain.setNextPhase(entity.getNextPhase());
        return domain;
    }

    public MatchScheduleEntity toDomainSchedule(MatchSchedule domain) {
        MatchScheduleEntity entity = new MatchScheduleEntity();
        entity.setId(domain.getId());
        entity.setMatchId(domain.getMatchId());
        entity.setTournamentId(domain.getTournamentId());
        // entity.setJourneyId(domain.getJourneyId());
        entity.setMatchDay(domain.getMatchDay());
        entity.setMatchDate(domain.getMatchDate());
        entity.setMatchTime(domain.getMatchTime());
        // entity.setHomeTeamId(domain.getHomeTeamId());
        // entity.setAwayTeamId(domain.getAwayTeamId());
        entity.setHomeTeamName(domain.getHomeTeamName());
        entity.setAwayTeamName(domain.getAwayTeamName());
        entity.setTournamentName(domain.getTournamentName());
        // entity.setCategoryId(domain.getCategoryId());
        entity.setCategoryName(domain.getCategoryName());
        entity.setPhase(domain.getPhase());
        entity.setStatus(domain.getStatus());
        // entity.setDivisionName(domain.getDivisionName());
        return entity;
    }

    public MatchSchedule toEntityJpaSchedule(MatchScheduleEntity entity) {
        MatchSchedule domain = new MatchSchedule();
        domain.setId(entity.getId());
        domain.setMatchId(entity.getMatchId());
        domain.setTournamentId(entity.getTournamentId());
        // domain.setJourneyId(entity.getJourneyId());
        domain.setMatchDay(entity.getMatchDay());
        domain.setMatchDate(entity.getMatchDate());
        domain.setMatchTime(entity.getMatchTime());
        // domain.setHomeTeamId(entity.getHomeTeamId());
        // domain.setAwayTeamId(entity.getAwayTeamId());
        domain.setHomeTeamName(entity.getHomeTeamName());
        domain.setAwayTeamName(entity.getAwayTeamName());
        domain.setTournamentName(entity.getTournamentName());
        // domain.setCategoryId(entity.getCategoryId());
        domain.setCategoryName(entity.getCategoryName());
        domain.setPhase(entity.getPhase());
        domain.setStatus(entity.getStatus());
        // domain.setDivisionName(entity.getDivisionName());
        return domain;
    }

    public List<MatchScheduleEntity> toDomainList(List<MatchSchedule> domainList) {
        return domainList.stream()
                .map(this::toDomainSchedule)
                .collect(Collectors.toList());
    }

    public List<MatchSchedule> toEntityJpaList(List<MatchScheduleEntity> entityList) {
        return entityList.stream()
                .map(this::toEntityJpaSchedule)
                .collect(Collectors.toList());
    }
}
