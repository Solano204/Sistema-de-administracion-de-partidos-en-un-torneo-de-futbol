package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.ports.input.service.TournamentApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - TournamentController has the richest
// validation logic of any controller in this codebase (getMatchesInDateRange
// hand-rolls null/empty checks, ISO-date parsing with a try/catch, and a
// start-after-end check, all before ever calling the service), so it gets
// the deepest per-branch coverage here.
@ExtendWith(MockitoExtension.class)
class TournamentControllerTest {

    @Mock private TournamentApplicationService tournamentApplicationService;

    private TournamentController tournamentController;

    @BeforeEach
    void setUp() {
        tournamentController = new TournamentController(tournamentApplicationService);
    }

    @Test
    void initializeTournament_delegatesDirectlyToTheService() {
        TournamentInfoRecord request = mock(TournamentInfoRecord.class);
        when(tournamentApplicationService.initializeTournament(request)).thenReturn(request);

        assertThat(tournamentController.initializeTournament(request)).isSameAs(request);
    }

    // ── getMatchesInDateRange: hand-rolled validation, no @Valid/@NotNull ──

    @Test
    void getMatchesInDateRange_emptyStartDate_returns400WithoutCallingTheService() {
        ResponseEntity<List<MatchScheduleInfoRecord>> response =
                tournamentController.getMatchesInDateRange("", "2026-12-31");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(tournamentApplicationService);
    }

    @Test
    void getMatchesInDateRange_unparsableDate_returns400NotAnUncaughtException() {
        ResponseEntity<List<MatchScheduleInfoRecord>> response =
                tournamentController.getMatchesInDateRange("not-a-date", "2026-12-31");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(tournamentApplicationService);
    }

    @Test
    void getMatchesInDateRange_startAfterEnd_returns400WithoutCallingTheService() {
        ResponseEntity<List<MatchScheduleInfoRecord>> response =
                tournamentController.getMatchesInDateRange("2026-12-31", "2026-01-01");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(tournamentApplicationService);
    }

    @Test
    void getMatchesInDateRange_validRange_delegatesParsedDatesAndReturns200() {
        List<MatchScheduleInfoRecord> matches = List.of();
        when(tournamentApplicationService.getMatchesInDateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31)))
                .thenReturn(matches);

        ResponseEntity<List<MatchScheduleInfoRecord>> response =
                tournamentController.getMatchesInDateRange("2026-01-01", "2026-12-31");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(matches);
    }

    // ── putMethodName: String -> UUID conversion + a hardcoded status ─────

    @Test
    void putMethodName_validUuidString_delegatesWithHardcodedJugadoStatus() {
        UUID matchId = UUID.randomUUID();
        when(tournamentApplicationService.updateMatchStatus(matchId, MatchStatus.JUGADO)).thenReturn(true);

        assertThat(tournamentController.putMethodName(matchId.toString())).isTrue();
    }

    @Test
    void putMethodName_malformedUuidString_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> tournamentController.putMethodName("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(tournamentApplicationService);
    }

    // ── scheduleMatch: 201 Created, unlike every other write endpoint here ─

    @Test
    void scheduleMatch_returns201CreatedWithTheServiceResult() {
        List<WeeklyScheduleRecordRequest> request = List.of(mock(WeeklyScheduleRecordRequest.class));
        when(tournamentApplicationService.scheduleMatchs(request)).thenReturn(true);

        ResponseEntity<Boolean> response = tournamentController.scheduleMatch(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isTrue();
    }

    @Test
    void getAmountTeams_delegatesDirectlyToTheService() {
        UUID categoryId = UUID.randomUUID();
        when(tournamentApplicationService.getNumberOfTeams(categoryId)).thenReturn(6);

        assertThat(tournamentController.getAmountTeams(categoryId)).isEqualTo(6);
    }
}
