package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.MatchEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.helpers.MatchCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.MatchMapper;
import com.soccer.fut7.soccer_system.team.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - MatchAdapter is the largest/most
// complex file in soccer-dataacess (484 lines, 8 injected collaborators).
// Given the scale, this pass covers only createMatch (the one method that's
// genuinely self-contained: its own validation logic, only 2 of the 8
// collaborators involved) plus updateMatchStatus (trivial delegation).
// updateMatchStats/enrichMatchWithStats/enrichMatchWithoutStats (the other
// ~350 lines) need a much larger fixture graph across most of the other 6
// collaborators for comparatively lower additional-risk coverage per line -
// left for a dedicated future pass, see TESTING-STRATEGY.md.
//
// Found, not fixed (documented as a real, live risk): enrichMatchWithStats
// and enrichMatchWithoutStats both fetch homeTeamStats/awayTeamStats via
// `.findFirst().orElse(null)` and then immediately call
// `homeTeamStats.getGoals()` unconditionally, with NO null-check in
// between - if a match has no TeamMatchStatsEntity row yet for one of its
// teams (e.g. a freshly created match, before any stats exist), this NPEs.
// Not changed here: fixing it means deciding what SHOULD happen instead
// (skip enrichment? default to zero stats?), a product decision beyond
// what a test-writing pass should guess at.
@ExtendWith(MockitoExtension.class)
class MatchAdapterTest {

    @Mock private TeamMatchStatsRepositoryData teamMatchStatsRepositoryData;
    @Mock private MatchCommandHelperRepository matchCommandHelperRepository;
    @Mock private MatchMapper matchMapper;
    @Mock private TeamRepositoryData teamRepositoryData;
    @Mock private TeamStatsRepositoryData teamStatsRepositoryData;
    @Mock private CategoryRepositoryData categoryRepositoryData;
    @Mock private TournamentRepositoryData tourmentRepositoryData;
    @Mock private UserRepositoryData userRepositoryData;

    private MatchAdapter matchAdapter;

    @BeforeEach
    void setUp() {
        matchAdapter = new MatchAdapter(teamMatchStatsRepositoryData, matchCommandHelperRepository, matchMapper,
                teamRepositoryData, teamStatsRepositoryData, categoryRepositoryData, tourmentRepositoryData,
                userRepositoryData);
    }

    @Test
    void createMatch_homeTeamDoesNotExist_throwsIllegalArgumentException() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        when(teamRepositoryData.findById(team1)).thenReturn(Optional.empty());
        when(teamRepositoryData.findById(team2)).thenReturn(Optional.of(TeamEntity.builder().build()));

        assertThatThrownBy(() -> matchAdapter.createMatch(team1, team2, LocalDate.now(), UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
        verifyNoInteractions(matchCommandHelperRepository);
    }

    @Test
    void createMatch_teamsInDifferentCategories_throwsIllegalArgumentException() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        TeamEntity homeTeam = TeamEntity.builder().category(CategoryEntity.builder().id(UUID.randomUUID()).build()).build();
        TeamEntity awayTeam = TeamEntity.builder().category(CategoryEntity.builder().id(UUID.randomUUID()).build()).build();
        when(teamRepositoryData.findById(team1)).thenReturn(Optional.of(homeTeam));
        when(teamRepositoryData.findById(team2)).thenReturn(Optional.of(awayTeam));

        assertThatThrownBy(() -> matchAdapter.createMatch(team1, team2, LocalDate.now(), UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("same category");
        verifyNoInteractions(matchCommandHelperRepository);
    }

    @Test
    void createMatch_bothTeamsExistInTheSameCategory_delegatesToTheCommandHelperRepository() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID refereeId = UUID.randomUUID();
        LocalDate matchDate = LocalDate.now();
        CategoryEntity sharedCategory = CategoryEntity.builder().id(categoryId).build();
        TeamEntity homeTeam = TeamEntity.builder().category(sharedCategory).build();
        TeamEntity awayTeam = TeamEntity.builder().category(sharedCategory).build();
        MatchEntity createdEntity = MatchEntity.builder().id(UUID.randomUUID()).build();
        Match createdDomain = Match.builder().id(createdEntity.getId()).build();
        when(teamRepositoryData.findById(team1)).thenReturn(Optional.of(homeTeam));
        when(teamRepositoryData.findById(team2)).thenReturn(Optional.of(awayTeam));
        when(matchCommandHelperRepository.createMatch(homeTeam, awayTeam, matchDate, refereeId, categoryId))
                .thenReturn(Optional.of(createdEntity));
        when(matchMapper.toDomain(createdEntity)).thenReturn(createdDomain);

        Optional<Match> result = matchAdapter.createMatch(team1, team2, matchDate, refereeId, categoryId);

        assertThat(result).contains(createdDomain);
    }

    @Test
    void updateMatchStatus_delegatesDirectlyToTheCommandHelperRepository() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        when(matchCommandHelperRepository.updateMatchStatus(matchId, tournamentId, MatchStatus.JUGADO))
                .thenReturn(Optional.of(true));

        assertThat(matchAdapter.updateMatchStatus(matchId, tournamentId, MatchStatus.JUGADO)).contains(true);
    }
}
