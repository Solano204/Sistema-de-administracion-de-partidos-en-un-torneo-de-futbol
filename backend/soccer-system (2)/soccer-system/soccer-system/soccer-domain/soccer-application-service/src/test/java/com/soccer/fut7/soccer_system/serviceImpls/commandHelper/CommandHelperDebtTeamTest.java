package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ExceptionApplication.DebtException;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto;
import com.soccer.fut7.soccer_system.mappers.DebtMapperDomain;
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
// pins down the throw-on-empty behavior on every method and that deletes
// pass their arguments through unchanged.
@ExtendWith(MockitoExtension.class)
class CommandHelperDebtTeamTest {

    @Mock private TeamDebtRepository teamDebtRepository;
    @Mock private DebtMapperDomain debtMapper;

    private CommandHelperDebtTeam commandHelperDebtTeam;

    @BeforeEach
    void setUp() {
        commandHelperDebtTeam = new CommandHelperDebtTeam(teamDebtRepository, debtMapper);
    }

    @Test
    void insertTeamDebt_repositoryFailsToInsert_throwsDebtException() {
        DebtRecordDto dto = new DebtRecordDto(null, null, null, null, null, null, null, null);
        TeamDebt mapped = TeamDebt.builder().build();
        when(debtMapper.debtRecordDtoToTeamDebt(dto)).thenReturn(mapped);
        when(teamDebtRepository.insertTeamDebt(mapped)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtTeam.insertTeamDebt(dto))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void updateTeamDebtStatus_repositoryReturnsEmpty_throwsDebtException() {
        UUID debtId = UUID.randomUUID();
        LocalDate paidDate = LocalDate.now();
        when(teamDebtRepository.updateTeamDebtStatus(debtId, DebtStatus.PAGADO, paidDate)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtTeam.updateTeamDebtStatus(debtId, DebtStatus.PAGADO, paidDate))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void getAllTeamDebts_repositoryReturnsEmpty_throwsDebtException() {
        UUID teamId = UUID.randomUUID();
        when(teamDebtRepository.getAllTeamDebts(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperDebtTeam.getAllTeamDebts(teamId))
                .isInstanceOf(DebtException.class);
    }

    @Test
    void deleteTeamDebtByDate_delegatesArgumentsUnchanged() {
        UUID teamId = UUID.randomUUID();
        LocalDate dueDate = LocalDate.now();

        commandHelperDebtTeam.deleteTeamDebtByDate(teamId, dueDate);

        verify(teamDebtRepository).deleteTeamDebtByDate(teamId, dueDate);
    }

    @Test
    void deleteAllTeamDebts_delegatesDirectlyToRepository() {
        UUID teamId = UUID.randomUUID();

        commandHelperDebtTeam.deleteAllTeamDebts(teamId);

        verify(teamDebtRepository).deleteAllTeamDebts(teamId);
    }
}
