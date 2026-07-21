package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.MatchScheduleEntity;
import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.dto.tourment.MatchScheduleInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.TournamentInfoRecord;
import com.soccer.fut7.soccer_system.dto.tourment.WeeklyScheduleRecordRequest;
import com.soccer.fut7.soccer_system.mappers.TournamentMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.TourmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. CommandHelperTournament is almost pure
// repository+mapper pass-through with no validation branches of its own
// (unlike CommandHelperTeam/Match/Player, which gate on existence checks) -
// these tests confirm the pass-through itself: right repository method,
// right arguments, mapped result returned unchanged. Not every one of its
// ~15 methods is covered individually since they all share this exact same
// one-line-delegation shape; these are representative.
@ExtendWith(MockitoExtension.class)
class CommandHelperTournamentTest {

    @Mock private TourmentRepository tournamentRepository;
    @Mock private TournamentMapperDomain tournamentMapper;

    private CommandHelperTournament commandHelperTournament;

    @BeforeEach
    void setUp() {
        commandHelperTournament = new CommandHelperTournament(tournamentRepository, tournamentMapper);
    }

    @Test
    void initializeTournament_delegatesToRepositoryAndReturnsTheOriginalInputUnchanged() {
        // Deliberate behavior, not an oversight: the repository call is
        // treated as a void trigger for a stored procedure, so the method
        // returns the ORIGINAL input object rather than anything read back
        // from the repository - pinning that down so a future change from
        // "fire and forget" to "read back the real result" is a conscious choice.
        TournamentInfoRecord input = mock(TournamentInfoRecord.class);
        TourmentEntity entity = mock(TourmentEntity.class);
        when(tournamentMapper.tournamentInfoRecordToTournament(input)).thenReturn(entity);

        TournamentInfoRecord result = commandHelperTournament.initializeTournament(input);

        assertThat(result).isSameAs(input);
        verify(tournamentRepository).initializeTournament(entity);
    }

    @Test
    void simulateRoundRobinMatches_delegatesDirectlyToRepository() {
        UUID tournamentId = UUID.randomUUID();

        commandHelperTournament.simulateRoundRobinMatches(tournamentId);

        verify(tournamentRepository).simulateRoundRobinMatches(tournamentId);
    }

    @Test
    void getMatchesInDateRange_mapsRepositoryResultThroughTheMapper() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 12, 31);
        List<MatchScheduleEntity> entities = List.of(mock(MatchScheduleEntity.class));
        List<MatchScheduleInfoRecord> mapped = List.of(mock(MatchScheduleInfoRecord.class));
        when(tournamentRepository.getMatchesInDateRange(start, end)).thenReturn(entities);
        when(tournamentMapper.matchScheduleListToMatchScheduleInfoRecordList(entities)).thenReturn(mapped);

        assertThat(commandHelperTournament.getMatchesInDateRange(start, end)).isSameAs(mapped);
    }

    @Test
    void scheduleMatchs_mapsRequestListBeforeDelegatingToRepository() {
        List<WeeklyScheduleRecordRequest> request = List.of(mock(WeeklyScheduleRecordRequest.class));
        List<MatchScheduleEntity> mappedEntities = List.of(mock(MatchScheduleEntity.class));
        when(tournamentMapper.weeklyScheduleRecordsToEntities(request)).thenReturn(mappedEntities);
        when(tournamentRepository.scheduleMatchs(mappedEntities)).thenReturn(true);

        assertThat(commandHelperTournament.scheduleMatchs(request)).isTrue();
    }

    @Test
    void deleteTournament_delegatesDirectlyToRepository() {
        UUID tournamentId = UUID.randomUUID();

        commandHelperTournament.deleteTournament(tournamentId);

        verify(tournamentRepository).deleteTournament(tournamentId);
    }

    @Test
    void getNumberOfTeams_returnsRepositoryValueUnchanged() {
        UUID categoryId = UUID.randomUUID();
        when(tournamentRepository.getNumberOfTeams(categoryId)).thenReturn(8);

        assertThat(commandHelperTournament.getNumberOfTeams(categoryId)).isEqualTo(8);
    }
}
