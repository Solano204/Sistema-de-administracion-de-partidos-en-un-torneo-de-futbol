package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ExceptionApplication.DebtException;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.mappers.DebtMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.PlayerDebtRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamDebtRepository;
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

// Pure unit tests, Mockito-isolated - thin repository+mapper delegation;
// pins down the throw-on-empty behavior on every method that returns one.
@ExtendWith(MockitoExtension.class)
class CommandHelperDebtPlayerTest {

    @Mock private TeamDebtRepository teamDebtRepository;
    @Mock private PlayerDebtRepository playerDebtRepository;
    @Mock private DebtMapperDomain debtMapper;

    private CommandHelperDebtPlayer commandHelperDebtPlayer;

    @BeforeEach
    void setUp() {
        commandHelperDebtPlayer = new CommandHelperDebtPlayer(teamDebtRepository, playerDebtRepository, debtMapper);
    }

    @Test
    void insertPlayerDebt_repositoryFailsToInsert_throwsDebtException() {
        DebtRecordDto dto = new DebtRecordDto(null, null, null, null, null, null, null, null);
        PlayerDebt mapped = PlayerDebt.builder().build();
        when(debtMapper.debtRecordDtoToPlayerDebt(dto)).thenReturn(mapped);
        when(playerDebtRepository.insertPlayerDebt(mapped)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtPlayer.insertPlayerDebt(dto))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void updatePlayerDebtStatus_repositoryReturnsEmpty_throwsDebtException() {
        UUID debtId = UUID.randomUUID();
        LocalDate paidDate = LocalDate.now();
        when(playerDebtRepository.updatePlayerDebtStatus(debtId, DebtStatus.PAGADO, paidDate)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtPlayer.updatePlayerDebtStatus(debtId, DebtStatus.PAGADO, paidDate))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void getAllPlayerDebts_repositoryReturnsEmpty_throwsDebtException() {
        UUID playerId = UUID.randomUUID();
        when(playerDebtRepository.getAllPlayerDebts(playerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtPlayer.getAllPlayerDebts(playerId))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void deletePlayerDebtById_delegatesDirectlyToRepository() {
        UUID debtId = UUID.randomUUID();

        commandHelperDebtPlayer.deletePlayerDebtById(debtId);

        verify(playerDebtRepository).deletePlayerDebtById(debtId);
    }

    @Test
    void deleteAllPlayerDebts_delegatesDirectlyToRepository() {
        UUID playerId = UUID.randomUUID();

        commandHelperDebtPlayer.deleteAllPlayerDebts(playerId);

        verify(playerDebtRepository).deleteAllPlayerDebts(playerId);
    }
}
