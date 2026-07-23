package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.ports.input.service.DebtPlayerApplicationService;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
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

// Pure unit tests, no Spring context - pure delegation to two services;
// pins down ResponseEntity wrapping and that getPlayersByName specifically
// re-materializes the service's Set into a List (the one non-trivial
// transformation in this controller).
@ExtendWith(MockitoExtension.class)
class DebtPlayerControllerTest {

    @Mock private DebtPlayerApplicationService debtPlayerApplicationService;
    @Mock private PlayerApplicationService playerApplicationService;

    private DebtPlayerController debtPlayerController;

    @BeforeEach
    void setUp() {
        debtPlayerController = new DebtPlayerController(debtPlayerApplicationService, playerApplicationService);
    }

    @Test
    void insertPlayerDebt_returns200WithTheCreatedDebt() {
        DebtRecordDto request = new DebtRecordDto(null, UUID.randomUUID(), null, null, null, null, null, null);
        DebtRecordDto created = new DebtRecordDto(UUID.randomUUID(), null, null, null, null, null, null, null);
        when(debtPlayerApplicationService.insertPlayerDebt(request)).thenReturn(created);

        ResponseEntity<DebtRecordDto> response = debtPlayerController.insertPlayerDebt(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(created);
    }

    @Test
    void updatePlayerDebtStatus_delegatesAllThreeArgumentsInOrder() {
        UUID debtId = UUID.randomUUID();
        LocalDate paidDate = LocalDate.now();
        when(debtPlayerApplicationService.updatePlayerDebtStatus(debtId, DebtStatus.PENDIENTE, paidDate)).thenReturn(true);

        ResponseEntity<Boolean> response = debtPlayerController.updatePlayerDebtStatus(debtId, DebtStatus.PENDIENTE, paidDate);

        assertThat(response.getBody()).isTrue();
    }

    @Test
    void deletePlayerDebtById_delegatesThenReturns204NoContent() {
        UUID debtId = UUID.randomUUID();

        ResponseEntity<Void> response = debtPlayerController.deletePlayerDebtById(debtId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(debtPlayerApplicationService).deletePlayerDebtById(debtId);
    }

    @Test
    void getPlayersByName_delegatesToPlayerApplicationServiceAndPreservesEveryElement() {
        PlayerSummaryRecord player = mock(PlayerSummaryRecord.class);
        when(playerApplicationService.getPlayersByName("Carlos")).thenReturn(Set.of(player));

        List<PlayerSummaryRecord> result = debtPlayerController.getPlayersByName("Carlos");

        assertThat(result).containsExactly(player);
        verifyNoInteractions(debtPlayerApplicationService);
    }
}
