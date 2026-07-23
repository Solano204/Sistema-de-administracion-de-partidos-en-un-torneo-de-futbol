package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ExceptionApplication.MatchException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.MatchRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. CommandHelperMatch's real logic is its
// team-existence validation ahead of every match-creation/lookup-by-team
// operation - this pins down both the "does it validate at all" and the
// "which team's exception fires, in what order" behavior (home before away,
// team1 before team2), since a caller-facing error message depends on it.
@ExtendWith(MockitoExtension.class)
class CommandHelperMatchTest {

    @Mock private EntityDtoMapperDomain mapper;
    @Mock private MatchRepository matchRepository;
    @Mock private TeamRepository teamRepository;

    private CommandHelperMatch commandHelperMatch;

    @BeforeEach
    void setUp() {
        commandHelperMatch = new CommandHelperMatch(mapper, matchRepository, teamRepository);
    }

    // ── createMatch: home team checked before away team ────────────────────

    @Test
    void createMatch_homeTeamDoesNotExist_throwsTeamExceptionAndNeverChecksAwayTeam() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.createMatch(team1, team2, LocalDate.now(), UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(teamException.class)
                .hasMessageContaining("Home team not found");
        verify(teamRepository, never()).existTeam(team2);
        verifyNoInteractions(matchRepository);
    }

    @Test
    void createMatch_homeTeamExistsButAwayTeamDoesNot_throwsTeamExceptionForAwayTeam() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.of(true));
        when(teamRepository.existTeam(team2)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.createMatch(team1, team2, LocalDate.now(), UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(teamException.class)
                .hasMessageContaining("Away team not found");
        verifyNoInteractions(matchRepository);
    }

    @Test
    void createMatch_bothTeamsExistButRepositoryFails_throwsMatchException() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        UUID category = UUID.randomUUID();
        UUID referee = UUID.randomUUID();
        LocalDate date = LocalDate.now();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.of(true));
        when(teamRepository.existTeam(team2)).thenReturn(Optional.of(true));
        when(matchRepository.createMatch(team1, team2, date, referee, category)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.createMatch(team1, team2, date, referee, category))
                .isInstanceOf(MatchException.class);
    }

    @Test
    void createMatch_bothTeamsExistAndRepositorySucceeds_returnsCreatedMatch() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        UUID category = UUID.randomUUID();
        UUID referee = UUID.randomUUID();
        LocalDate date = LocalDate.now();
        Match created = Match.builder().id(UUID.randomUUID()).build();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.of(true));
        when(teamRepository.existTeam(team2)).thenReturn(Optional.of(true));
        when(matchRepository.createMatch(team1, team2, date, referee, category)).thenReturn(Optional.of(created));

        Match result = commandHelperMatch.createMatch(team1, team2, date, referee, category);

        assertThat(result).isSameAs(created);
    }

    // ── lookups gated on a single team's existence ─────────────────────────

    @Test
    void getMatchesByTeamWithStats_teamDoesNotExist_throwsTeamExceptionAndNeverQueriesMatches() {
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.getMatchesByTeamWithStats(teamId))
                .isInstanceOf(teamException.class);
        verifyNoInteractions(matchRepository);
    }

    @Test
    void getMatchesByTeamWithStats_teamExists_returnsMatchesFromRepository() {
        UUID teamId = UUID.randomUUID();
        List<Match> matches = List.of(Match.builder().id(UUID.randomUUID()).build());
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.of(true));
        when(matchRepository.getMatchesByTeamWithStats(teamId)).thenReturn(matches);

        assertThat(commandHelperMatch.getMatchesByTeamWithStats(teamId)).isSameAs(matches);
    }

    // ── lookups gated on BOTH teams, with team-specific error messages ─────

    @Test
    void getMatchesBetweenTeamsWithStats_firstTeamMissing_messageIdentifiesTeam1() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.getMatchesBetweenTeamsWithStats(team1, team2))
                .hasMessageContaining("Team 1 not found");
    }

    @Test
    void getMatchesBetweenTeamsWithStats_secondTeamMissing_messageIdentifiesTeam2() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        when(teamRepository.existTeam(team1)).thenReturn(Optional.of(true));
        when(teamRepository.existTeam(team2)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.getMatchesBetweenTeamsWithStats(team1, team2))
                .hasMessageContaining("Team 2 not found");
    }

    // ── lookups with no existence validation at all ────────────────────────

    @Test
    void getMatchByIdWithoutStats_notFound_throwsMatchException() {
        UUID matchId = UUID.randomUUID();
        UUID tournamentId = UUID.randomUUID();
        when(matchRepository.getMatchByIdWithoutStats(matchId, tournamentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperMatch.getMatchByIdWithoutStats(matchId, tournamentId))
                .isInstanceOf(MatchException.class);
        verifyNoInteractions(teamRepository);
    }

    @Test
    void getAllMatchesByCategory_mapsEveryMatchThroughTheMapper() {
        UUID categoryId = UUID.randomUUID();
        CustomMatchDetails match = CustomMatchDetails.builder().idMatch(UUID.randomUUID()).build();
        MatchTinyDetails details = new MatchTinyDetails(match.getIdMatch(), null, null, null, null, null, null, null);
        when(matchRepository.getAllMatchesByCategory(categoryId)).thenReturn(List.of(match));
        when(mapper.matchToMatchTinyDetails(match)).thenReturn(details);

        Set<MatchTinyDetails> result = commandHelperMatch.getAllMatchesByCategory(categoryId);

        assertThat(result).containsExactly(details);
    }
}
