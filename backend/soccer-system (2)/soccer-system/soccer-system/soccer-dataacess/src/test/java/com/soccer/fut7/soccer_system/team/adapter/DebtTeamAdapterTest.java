package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.team.helpers.TeamDebtCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.TeamDebtMapper;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// Pure unit tests - structurally identical to DebtPlayerAdapterTest
// (insertTeamDebt/updateTeamDebt gate on team existence; everything else is
// pass-through), TeamRepository instead of PlayerRepository.
@ExtendWith(MockitoExtension.class)
class DebtTeamAdapterTest {

    @Mock private TeamDebtCommandHelperRepository teamDebtCommandHelperRepository;
    @Mock private TeamDebtMapper teamDebtMapper;
    @Mock private TeamRepositoryData teamRepositoryData;

    private DebtTeamAdapter debtTeamAdapter;

    @BeforeEach
    void setUp() {
        debtTeamAdapter = new DebtTeamAdapter(teamDebtCommandHelperRepository, teamDebtMapper, teamRepositoryData);
    }

    @Test
    void insertTeamDebt_teamDoesNotExist_throwsIllegalArgumentException() {
        UUID teamId = UUID.randomUUID();
        TeamDebt debt = TeamDebt.builder().teamId(teamId).build();
        when(teamRepositoryData.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtTeamAdapter.insertTeamDebt(debt))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(teamId.toString());
        verifyNoInteractions(teamDebtCommandHelperRepository);
    }

    @Test
    void updateTeamDebt_teamDoesNotExist_throwsIllegalArgumentException() {
        UUID teamId = UUID.randomUUID();
        TeamDebt debt = TeamDebt.builder().teamId(teamId).build();
        when(teamRepositoryData.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtTeamAdapter.updateTeamDebt(UUID.randomUUID(), debt))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(teamDebtCommandHelperRepository);
    }
}
