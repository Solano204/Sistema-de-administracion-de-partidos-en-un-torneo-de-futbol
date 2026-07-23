package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.team.dto.projection.MatchWithFullDetailsDTO;
import com.soccer.fut7.soccer_system.team.entitiy.MatchEntity;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Pure unit tests. MatchWithFullDetailsDTO is mocked rather than
// constructed via its 21-argument all-args constructor (its only
// constructor) - far more error-prone to keep positionally correct than to
// stub the handful of getters each test actually needs.
class MatchMapperProjectionTest {

    private final MatchMapperProjection matchMapperProjection = new MatchMapperProjection();

    private MatchWithFullDetailsDTO baseRow() {
        MatchWithFullDetailsDTO row = mock(MatchWithFullDetailsDTO.class);
        when(row.getId()).thenReturn(UUID.randomUUID());
        when(row.getMatchDate()).thenReturn(LocalDate.of(2026, 3, 1));
        when(row.getTournamentId()).thenReturn(UUID.randomUUID());
        when(row.getHomeTeamId()).thenReturn(UUID.randomUUID());
        when(row.getHomeTeamName()).thenReturn("Home FC");
        when(row.getAwayTeamId()).thenReturn(UUID.randomUUID());
        when(row.getAwayTeamName()).thenReturn("Away FC");
        when(row.getPhase()).thenReturn("ROUND_ROBIN");
        when(row.getMatchStatus()).thenReturn("PENDIENTE");
        return row;
    }

    @Test
    void mapMatchesWithTeams_noWinnerAndNoJourney_leavesBothUnset() {
        MatchWithFullDetailsDTO row = baseRow();
        when(row.getWinnerTeamId()).thenReturn(null);
        when(row.getJourneyId()).thenReturn(null);

        MatchEntity result = matchMapperProjection.mapMatchesWithTeams(row);

        assertThat(result.getWinnerTeam()).isNull();
        assertThat(result.getJourney()).isNull();
    }

    @Test
    void mapMatchesWithTeams_winnerPresent_buildsAWinnerTeamEntity() {
        MatchWithFullDetailsDTO row = baseRow();
        UUID winnerId = UUID.randomUUID();
        when(row.getWinnerTeamId()).thenReturn(winnerId);
        when(row.getWinnerTeamName()).thenReturn("Home FC");
        when(row.getJourneyId()).thenReturn(null);

        MatchEntity result = matchMapperProjection.mapMatchesWithTeams(row);

        assertThat(result.getWinnerTeam().getId()).isEqualTo(winnerId);
        assertThat(result.getWinnerTeam().getTeamName()).isEqualTo("Home FC");
    }

    @Test
    void mapMatchesWithTeams_journeyPresent_buildsAJourneyEntity() {
        MatchWithFullDetailsDTO row = baseRow();
        UUID journeyId = UUID.randomUUID();
        when(row.getWinnerTeamId()).thenReturn(null);
        when(row.getJourneyId()).thenReturn(journeyId);
        when(row.getJourneyNumber()).thenReturn(5);

        MatchEntity result = matchMapperProjection.mapMatchesWithTeams(row);

        assertThat(result.getJourney().getId()).isEqualTo(journeyId);
        assertThat(result.getJourney().getJourneyNumber()).isEqualTo(5);
    }

    @Test
    void mapMatchesWithTeams_alwaysBuildsHomeAndAwayTeamStatsRegardlessOfWinnerOrJourney() {
        MatchWithFullDetailsDTO row = baseRow();
        when(row.getWinnerTeamId()).thenReturn(null);
        when(row.getJourneyId()).thenReturn(null);

        MatchEntity result = matchMapperProjection.mapMatchesWithTeams(row);

        assertThat(result.getHomeTeamStats().getTeam().getTeamName()).isEqualTo("Home FC");
        assertThat(result.getAwayTeamStats().getTeam().getTeamName()).isEqualTo("Away FC");
    }
}
