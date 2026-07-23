package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtTeamApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - pure delegation to two services
// (DebtTeamApplicationService for debts, TeamApplicationService for the one
// name-search endpoint bolted onto this controller); pins down the
// ResponseEntity wrapping and which service each endpoint actually calls.
@ExtendWith(MockitoExtension.class)
class DebtTeamControllerTest {

    @Mock private DebtTeamApplicationService debtTeamApplicationService;
    @Mock private TeamApplicationService teamApplicationService;

    private DebtTeamController debtTeamController;

    @BeforeEach
    void setUp() {
        debtTeamController = new DebtTeamController(debtTeamApplicationService, teamApplicationService);
    }

    @Test
    void insertTeamDebt_returns200WithTheCreatedDebt() {
        DebtRecordDto request = new DebtRecordDto(null, UUID.randomUUID(), null, null, null, null, null, null);
        DebtRecordDto created = new DebtRecordDto(UUID.randomUUID(), null, null, null, null, null, null, null);
        when(debtTeamApplicationService.insertTeamDebt(request)).thenReturn(created);

        ResponseEntity<DebtRecordDto> response = debtTeamController.insertTeamDebt(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(created);
    }

    @Test
    void updateTeamDebtStatus_delegatesAllThreeArgumentsInOrder() {
        UUID debtId = UUID.randomUUID();
        LocalDate paidDate = LocalDate.now();
        when(debtTeamApplicationService.updateTeamDebtStatus(debtId, DebtStatus.PAGADO, paidDate)).thenReturn(true);

        ResponseEntity<Boolean> response = debtTeamController.updateTeamDebtStatus(debtId, DebtStatus.PAGADO, paidDate);

        assertThat(response.getBody()).isTrue();
    }

    @Test
    void deleteTeamDebtByDate_delegatesThenReturns204NoContent() {
        UUID teamId = UUID.randomUUID();
        LocalDate dueDate = LocalDate.now();

        ResponseEntity<Void> response = debtTeamController.deleteTeamDebtByDate(teamId, dueDate);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(debtTeamApplicationService).deleteTeamDebtByDate(teamId, dueDate);
    }

    @Test
    void getTeamsByName_delegatesToTeamApplicationServiceNotDebtService() {
        List<TeamNameIdRecord> teams = List.of();
        when(teamApplicationService.getTeamsByName("Tigres")).thenReturn(teams);

        assertThat(debtTeamController.getTeamsByName("Tigres")).isSameAs(teams);
        verifyNoInteractions(debtTeamApplicationService);
    }
}
