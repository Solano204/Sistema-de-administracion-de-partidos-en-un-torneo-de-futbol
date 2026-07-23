package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.ports.input.service.MatchApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - only 3 of this controller's endpoints
// are active (the rest are commented out - see the class source), so this
// covers exactly those 3. Pure delegation; real branching/validation logic
// (team-existence checks, etc.) is covered at CommandHelperMatchTest.
@ExtendWith(MockitoExtension.class)
class MatchControllerTest {

    @Mock private MatchApplicationService matchApplicationService;

    private MatchController matchController;

    @BeforeEach
    void setUp() {
        matchController = new MatchController(matchApplicationService);
    }

    @Test
    void getAllMatchesByCategory_delegatesDirectlyToTheService() {
        UUID categoryId = UUID.randomUUID();
        Set<MatchTinyDetails> matches = Set.of();
        when(matchApplicationService.getAllMatchesByCategory(categoryId)).thenReturn(matches);

        assertThat(matchController.getAllMatchesByCategory(categoryId)).isSameAs(matches);
    }

    @Test
    void updateMatchStats_delegatesAllThreeArgumentsInOrder() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        MatchResults results = mock(MatchResults.class);
        Match updated = Match.builder().id(matchId).build();
        when(matchApplicationService.updateMatchStats(matchId, tournamentId, results)).thenReturn(updated);

        Match result = matchController.updateMatchStats(matchId, tournamentId, results);

        assertThat(result).isSameAs(updated);
    }

    @Test
    void getMatchByIdWithStats_delegatesMatchIdAndTournamentIdInOrder() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        Match match = Match.builder().id(matchId).build();
        when(matchApplicationService.getMatchByIdWithStats(matchId, tournamentId)).thenReturn(match);

        assertThat(matchController.getMatchByIdWithStats(matchId, tournamentId)).isSameAs(match);
    }
}
