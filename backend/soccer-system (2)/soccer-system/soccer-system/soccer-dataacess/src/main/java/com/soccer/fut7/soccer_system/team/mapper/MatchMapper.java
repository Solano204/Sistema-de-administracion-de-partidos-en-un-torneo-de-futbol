package com.soccer.fut7.soccer_system.team.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails.InnerCustomMatchDetails;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.InfoTeamMatch;
import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchPhase;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.JourneyEntity;
import com.soccer.fut7.soccer_system.team.entitiy.MatchEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamMatchStatsEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.repository.JourneyRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TournamentRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.UserRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MatchMapper extends BaseMapper implements EntityMapper<Match, MatchEntity> {

        private final UserRepositoryData userRepository;
        private final TeamRepositoryData teamRepository;
        private final TournamentRepositoryData tournamentRepository;
        private final JourneyRepositoryData journeyRepository;

        @Override
        public MatchEntity toEntity(Match domain) {
                if (domain == null)
                        return null;

                CategoryMapper categoryMapper = getMapper(CategoryMapper.class);
                UserMapper userMapper = getMapper(UserMapper.class);

                return MatchEntity.builder()
                                .id(domain.getId())
                                .category(categoryMapper.UUIDtoEntity(domain.getCategoryId()))
                                .matchDate(domain.getMatchDate().value())
                                .matchStatus(domain.getStatus().toString())
                                .referee(userMapper.toEntity(domain.getReferee()))
                                // Handle home and away teams when needed
                                .build();
        }

        @Override
        public Match toDomain(MatchEntity entity) {
                if (entity == null)
                        return null;

                UserMapper userMapper = getMapper(UserMapper.class);

                return Match.builder()
                                .id(entity.getId())
                                .phase(formatPhase(entity.getPhase(), entity.getJourney().getJourneyNumber()))
                                .numberJourney(entity.getJourney().getJourneyNumber() == null ? 0
                                                : entity.getJourney().getJourneyNumber())
                                .tournament_id(entity.getTournament().getId())
                                .categoryId(entity.getHomeTeam().getCategory().getId())
                                .matchDate(new MatchDate(entity.getMatchDate()))
                                .status(MatchStatus.fromString(entity.getMatchStatus()))

                                .referee(entity.getReferee() == null ? null :  userMapper.toDomain(entity.getReferee()))
                                // Handle match results when needed
                                .build();
        }

        private String formatPhase(String phase, Integer journeyNumber) {
                if(phase.equals("ROUND_ROBIN")) {
                        return "JORNADA-" + journeyNumber;
                }
                return phase; // Use description for other phases
        }

        public CustomMatchDetails convertToCustomMatchDetails(MatchEntity matchEntity) {
                return CustomMatchDetails.builder()
                                .tournament_id(matchEntity.getTournament().getId())
                                .numberJourney(matchEntity.getJourney().getJourneyNumber())
                                .phase(formatPhase(matchEntity.getPhase(),
                                                matchEntity.getJourney().getJourneyNumber()))
                                .idMatch(matchEntity.getId())
                                .status(MatchStatus.fromString(matchEntity.getMatchStatus())
                                
                                )
                                
                                
                                .homeTeam(new InnerCustomMatchDetails(matchEntity.getHomeTeamStats().getTeam().getId(),
                                                matchEntity.getHomeTeamStats().getTeam().getTeamName()))
                                .awayTeam(new InnerCustomMatchDetails(matchEntity.getAwayTeamStats().getTeam().getId(),
                                                matchEntity.getAwayTeamStats().getTeam().getTeamName())
                                                )

                                                
                                .build();
        }

        public List<MatchEntity> mapMatchesWithStats(List<Object[]> results) {
                return results.stream().map(row -> {
                        MatchEntity match = new MatchEntity();

                        // Basic match fields
                        match.setId((UUID) row[0]);
                        match.setMatchDate(((java.sql.Date) row[1]).toLocalDate());
                        match.setReferee(userRepository.findById((UUID) row[2]).orElse(null));
                        match.setHomeTeam(teamRepository.findById((UUID) row[3]).orElse(null));
                        match.setAwayTeam(teamRepository.findById((UUID) row[4]).orElse(null));
                        match.setTournament(tournamentRepository.findById((UUID) row[5]).orElse(null));
                        match.setJourney(
                                        row[6] != null ? journeyRepository.findById((UUID) row[6]).orElse(null) : null);
                        match.setWinnerTeam(
                                        row[7] != null ? teamRepository.findById((UUID) row[7]).orElse(null) : null);
                        match.setPhase((String) row[8]);
                        match.setMatchStatus((String) row[9]);

                        // Home team stats
                        TeamMatchStatsEntity homeStats = new TeamMatchStatsEntity();
                        homeStats.setId((UUID) row[10]);
                        homeStats.setGoals((Integer) row[11]);
                        homeStats.setGoalsAgainst((Integer) row[12]);
                        homeStats.setPoints((Integer) row[13]);
                        match.setHomeTeamStats(homeStats);

                        // Away team stats
                        TeamMatchStatsEntity awayStats = new TeamMatchStatsEntity();
                        awayStats.setId((UUID) row[14]);
                        awayStats.setGoals((Integer) row[15]);
                        awayStats.setGoalsAgainst((Integer) row[16]);
                        awayStats.setPoints((Integer) row[17]);
                        match.setAwayTeamStats(awayStats);

                        return match;
                }).collect(Collectors.toList());
        }
}