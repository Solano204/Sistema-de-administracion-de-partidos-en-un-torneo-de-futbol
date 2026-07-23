package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.ValueObject.PaymentDate;
import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests - RefereePaymentMapper doesn't extend BaseMapper (UserMapper
// is constructor-injected directly).
//
// Found, documented (not changed): toDomainWithReferee never sets .id(...)
// on the builder, only .idPayment(...) - unlike toDomain, which sets BOTH to
// the same value. Any RefereePayment built via toDomainWithReferee ends up
// with BaseEntity.id == null even though idPayment is populated. Left as
// documented current behavior since it's unclear from this mapper alone
// whether every toDomainWithReferee call site relies on .id() at all.
@ExtendWith(MockitoExtension.class)
class RefereePaymentMapperTest {

    @Mock private UserMapper userMapper;

    private RefereePaymentMapper refereePaymentMapper;

    @BeforeEach
    void setUp() {
        refereePaymentMapper = new RefereePaymentMapper(userMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(refereePaymentMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_buildsABareRefereeEntityWithOnlyTheIdRatherThanDelegatingToUserMapper() {
        UUID refereeId = UUID.randomUUID();
        User referee = User.builder().id(refereeId).build();
        RefereePayment domain = RefereePayment.builder()
                .idPayment(UUID.randomUUID())
                .matchId(UUID.randomUUID())
                .referee(referee)
                .paymentDate(new PaymentDate(LocalDate.of(2026, 6, 1)))
                .hoursWorked(3.5)
                .hourlyRate(Money.of(new BigDecimal("100.00")))
                .amount(Money.of(new BigDecimal("350.00")))
                .build();

        RefereePaymentEntity result = refereePaymentMapper.toEntity(domain);

        assertThat(result.getReferee().getId()).isEqualTo(refereeId);
        verifyNoInteractions(userMapper);
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(refereePaymentMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_setsBothIdAndIdPaymentToTheSameEntityId() {
        UUID entityId = UUID.randomUUID();
        RefereePaymentEntity entity = buildEntity(entityId);
        when(userMapper.toDomain(entity.getReferee())).thenReturn(User.builder().id(UUID.randomUUID()).build());

        RefereePayment result = refereePaymentMapper.toDomain(entity);

        assertThat(result.getId()).isEqualTo(entityId);
        assertThat(result.getIdPayment()).isEqualTo(entityId);
    }

    @Test
    void toDomainWithReferee_leavesIdNullUnlikeToDomain() {
        UUID entityId = UUID.randomUUID();
        RefereePaymentEntity entity = buildEntity(entityId);
        when(userMapper.toDomain(entity.getReferee())).thenReturn(User.builder().id(UUID.randomUUID()).build());

        RefereePayment result = refereePaymentMapper.toDomainWithReferee(entity);

        assertThat(result.getIdPayment()).isEqualTo(entityId);
        assertThat(result.getId()).isNull();
    }

    private RefereePaymentEntity buildEntity(UUID id) {
        return RefereePaymentEntity.builder()
                .id(id)
                .referee(UserEntity.builder().id(UUID.randomUUID()).build())
                .matchId(UUID.randomUUID())
                .paymentDate(LocalDate.of(2026, 6, 1))
                .hoursWorked(new BigDecimal("3.5"))
                .hourlyRateAmount(new BigDecimal("100.00"))
                .totalPaymentAmount(new BigDecimal("350.00"))
                .currency("MXN")
                .build();
    }
}
