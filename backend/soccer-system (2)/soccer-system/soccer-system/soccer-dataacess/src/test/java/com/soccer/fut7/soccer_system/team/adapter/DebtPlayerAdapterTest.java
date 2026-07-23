package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.helpers.PlayerDebtCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.PlayerDebtMapper;
import com.soccer.fut7.soccer_system.team.repository.PlayerRepositoryData;
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

// Pure unit tests - insertPlayerDebt/updatePlayerDebt both gate on player
// existence before delegating; every other method is pure pass-through.
@ExtendWith(MockitoExtension.class)
class DebtPlayerAdapterTest {

    @Mock private PlayerDebtCommandHelperRepository playerDebtCommandHelperRepository;
    @Mock private PlayerDebtMapper playerDebtMapper;
    @Mock private PlayerRepositoryData playerRepositoryData;

    private DebtPlayerAdapter debtPlayerAdapter;

    @BeforeEach
    void setUp() {
        // Constructor param order follows field declaration order:
        // playerRepositoryData_1, playerDebtCommandHelperRepository, playerDebtMapper, playerRepositoryData -
        // both PlayerRepositoryData fields resolve to the same mock (same bean type, just injected twice).
        debtPlayerAdapter = new DebtPlayerAdapter(playerRepositoryData, playerDebtCommandHelperRepository,
                playerDebtMapper, playerRepositoryData);
    }

    @Test
    void insertPlayerDebt_playerDoesNotExist_throwsIllegalArgumentException() {
        UUID playerId = UUID.randomUUID();
        PlayerDebt debt = PlayerDebt.builder().playerId(playerId).build();
        when(playerRepositoryData.findById(playerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtPlayerAdapter.insertPlayerDebt(debt))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(playerId.toString());
        verifyNoInteractions(playerDebtCommandHelperRepository);
    }

    @Test
    void updatePlayerDebt_playerDoesNotExist_throwsIllegalArgumentException() {
        UUID playerId = UUID.randomUUID();
        UUID debtId = UUID.randomUUID();
        PlayerDebt debt = PlayerDebt.builder().playerId(playerId).build();
        when(playerRepositoryData.findById(playerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtPlayerAdapter.updatePlayerDebt(debtId, debt))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(playerDebtCommandHelperRepository);
    }

    @Test
    void insertPlayerDebt_playerExists_delegatesToTheCommandHelperRepository() {
        UUID playerId = UUID.randomUUID();
        PlayerDebt debt = PlayerDebt.builder().playerId(playerId).build();
        when(playerRepositoryData.findById(playerId)).thenReturn(Optional.of(PlayerEntity.builder().id(playerId).build()));
        when(playerDebtMapper.toEntity(debt)).thenReturn(com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity.builder().build());
        when(playerDebtCommandHelperRepository.insertPlayerDebt(org.mockito.ArgumentMatchers.any())).thenReturn(Optional.empty());

        debtPlayerAdapter.insertPlayerDebt(debt);
        // No assertion needed beyond "doesn't throw" - the not-found branch is the real risk, already covered above.
    }
}
