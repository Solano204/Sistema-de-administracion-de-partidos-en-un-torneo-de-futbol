package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.TeamDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.team.entitiy.TeamDebtEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Pure unit tests - structurally identical to PlayerDebtMapperTest (same
// mapper shape, TeamMapper instead of PlayerMapper as the one collaborator).
@ExtendWith(MockitoExtension.class)
class TeamDebtMapperTest {

    @Mock private TeamMapper teamMapper;

    private TeamDebtMapper teamDebtMapper;

    @BeforeEach
    void setUp() {
        teamDebtMapper = new TeamDebtMapper(teamMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(teamDebtMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_paidDateIsNull_leavesPaidDateNullOnTheEntity() {
        UUID teamId = UUID.randomUUID();
        TeamDebt domain = TeamDebt.builder()
                .id(UUID.randomUUID())
                .teamId(teamId)
                .status(DebtStatus.PENDIENTE)
                .amount(Money.of(new BigDecimal("500.00")))
                .dueDate(new DebtDate(LocalDate.of(2026, 6, 1)))
                .paidDate(null)
                .build();
        when(teamMapper.UUIDtoEntity(teamId)).thenReturn(TeamEntity.builder().id(teamId).build());

        TeamDebtEntity result = teamDebtMapper.toEntity(domain);

        assertThat(result.getPaidDate()).isNull();
        assertThat(result.getDebtStatus()).isEqualTo("PENDIENTE");
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(teamDebtMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_usesTheTeamsNameFieldDirectly() {
        TeamEntity team = TeamEntity.builder().id(UUID.randomUUID()).teamName("Los Tigres").build();
        TeamDebtEntity entity = TeamDebtEntity.builder()
                .id(UUID.randomUUID())
                .team(team)
                .debtStatus("PENDIENTE")
                .amount(new BigDecimal("500.00"))
                .currency("MXN")
                .dueDate(LocalDate.of(2026, 6, 1))
                .build();

        TeamDebt result = teamDebtMapper.toDomain(entity);

        assertThat(result.getName()).isEqualTo("Los Tigres");
        assertThat(result.getTeamId()).isEqualTo(team.getId());
    }

    @Test
    void toDomain_paidDateIsSet_wrapsItInADebtDate() {
        TeamEntity team = TeamEntity.builder().id(UUID.randomUUID()).teamName("Los Tigres").build();
        TeamDebtEntity entity = TeamDebtEntity.builder()
                .id(UUID.randomUUID())
                .team(team)
                .debtStatus("PAGADO")
                .amount(new BigDecimal("500.00"))
                .currency("MXN")
                .dueDate(LocalDate.of(2026, 6, 1))
                .paidDate(LocalDate.of(2026, 5, 15))
                .build();

        TeamDebt result = teamDebtMapper.toDomain(entity);

        assertThat(result.getPaidDate()).isEqualTo(new DebtDate(LocalDate.of(2026, 5, 15)));
    }
}
