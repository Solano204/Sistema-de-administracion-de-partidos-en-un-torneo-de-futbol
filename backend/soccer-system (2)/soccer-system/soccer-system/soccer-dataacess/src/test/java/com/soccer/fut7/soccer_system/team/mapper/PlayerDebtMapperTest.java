package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerDebtEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Currency;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Pure unit tests. PlayerDebtMapper doesn't extend BaseMapper - PlayerMapper
// is constructor-injected directly, so it's a plain @Mock, no
// ApplicationContext plumbing needed.
@ExtendWith(MockitoExtension.class)
class PlayerDebtMapperTest {

    @Mock private PlayerMapper playerMapper;

    private PlayerDebtMapper playerDebtMapper;

    @BeforeEach
    void setUp() {
        playerDebtMapper = new PlayerDebtMapper(playerMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(playerDebtMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_paidDateIsNull_leavesPaidDateNullOnTheEntity() {
        UUID playerId = UUID.randomUUID();
        PlayerDebt domain = PlayerDebt.builder()
                .id(UUID.randomUUID())
                .playerId(playerId)
                .status(DebtStatus.PENDIENTE)
                .amount(Money.of(new BigDecimal("100.00")))
                .dueDate(new DebtDate(LocalDate.of(2026, 6, 1)))
                .paidDate(null)
                .build();
        when(playerMapper.UUIDtoEntity(playerId)).thenReturn(PlayerEntity.builder().id(playerId).build());

        PlayerDebtEntity result = playerDebtMapper.toEntity(domain);

        assertThat(result.getPaidDate()).isNull();
        assertThat(result.getDebtStatus()).isEqualTo("PENDIENTE");
        assertThat(result.getCurrency()).isEqualTo("MXN"); // Money always normalizes to MXN - see Money's own comment
    }

    @Test
    void toEntity_paidDateIsSet_carriesItThroughToTheEntity() {
        UUID playerId = UUID.randomUUID();
        PlayerDebt domain = PlayerDebt.builder()
                .id(UUID.randomUUID())
                .playerId(playerId)
                .status(DebtStatus.PAGADO)
                .amount(Money.of(new BigDecimal("50.00")))
                .dueDate(new DebtDate(LocalDate.of(2026, 6, 1)))
                .paidDate(new DebtDate(LocalDate.of(2026, 5, 20)))
                .build();
        when(playerMapper.UUIDtoEntity(playerId)).thenReturn(PlayerEntity.builder().id(playerId).build());

        PlayerDebtEntity result = playerDebtMapper.toEntity(domain);

        assertThat(result.getPaidDate()).isEqualTo(LocalDate.of(2026, 5, 20));
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(playerDebtMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_joinsPlayerFirstAndLastNameIntoASingleNameField() {
        PlayerEntity player = PlayerEntity.builder().id(UUID.randomUUID()).firstName("Carlos").lastName("Perez").build();
        PlayerDebtEntity entity = PlayerDebtEntity.builder()
                .id(UUID.randomUUID())
                .player(player)
                .debtStatus("PENDIENTE")
                .amount(new BigDecimal("100.00"))
                .currency("MXN")
                .dueDate(LocalDate.of(2026, 6, 1))
                .build();

        PlayerDebt result = playerDebtMapper.toDomain(entity);

        assertThat(result.getName()).isEqualTo("Carlos Perez");
        assertThat(result.getPaidDate()).isNull();
    }

    @Test
    void toDomain_paidDateIsSet_wrapsItInADebtDate() {
        PlayerEntity player = PlayerEntity.builder().id(UUID.randomUUID()).firstName("Carlos").lastName("Perez").build();
        PlayerDebtEntity entity = PlayerDebtEntity.builder()
                .id(UUID.randomUUID())
                .player(player)
                .debtStatus("PAGADO")
                .amount(new BigDecimal("100.00"))
                .currency("MXN")
                .dueDate(LocalDate.of(2026, 6, 1))
                .paidDate(LocalDate.of(2026, 5, 20))
                .build();

        PlayerDebt result = playerDebtMapper.toDomain(entity);

        assertThat(result.getPaidDate()).isEqualTo(new DebtDate(LocalDate.of(2026, 5, 20)));
    }
}
