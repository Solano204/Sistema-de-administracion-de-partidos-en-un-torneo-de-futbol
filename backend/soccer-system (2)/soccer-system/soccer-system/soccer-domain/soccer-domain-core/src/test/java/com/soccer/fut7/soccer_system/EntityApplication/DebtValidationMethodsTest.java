package com.soccer.fut7.soccer_system.EntityApplication;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests, same package as the classes under test specifically to
// call their protected validate*() methods directly.
//
// Found, not fixed: Debt.validateDebt()/PlayerDebt.validatePlayerDebt()/
// TeamDebt.validateTeamDebt()/RefereePayment.validateRefereePayment() are
// declared but NEVER CALLED anywhere in this backend (grepped the whole
// module) - none of the SuperBuilder-generated builders invoke them, and no
// service layer calls them either. This means a PlayerDebt/TeamDebt with a
// null status, or a RefereePayment with an amount that doesn't match
// hoursWorked * hourlyRate, CAN currently be constructed and persisted
// without ever tripping these guards. Tested here anyway, calling each
// method directly, to document exactly what protection would exist IF
// something ever called them - this is the validation logic a future fix
// would presumably want to actually wire into construction.
class DebtValidationMethodsTest {

    @Test
    void debt_validateDebt_statusIsNull_throwsIllegalArgumentException() {
        PlayerDebt debt = PlayerDebt.builder().id(UUID.randomUUID()).status(null).build();

        assertThatThrownBy(debt::validatePlayerDebt)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("status cannot be null");
    }

    @Test
    void debt_validateDebt_statusPresent_doesNotThrow() {
        PlayerDebt debt = PlayerDebt.builder().id(UUID.randomUUID()).status(DebtStatus.PENDIENTE).build();

        assertThatCode(debt::validatePlayerDebt).doesNotThrowAnyException();
    }

    @Test
    void teamDebt_validateTeamDebt_statusIsNull_throwsIllegalArgumentException() {
        TeamDebt debt = TeamDebt.builder().id(UUID.randomUUID()).status(null).build();

        assertThatThrownBy(debt::validateTeamDebt).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void refereePayment_validateRefereePayment_refereeIsNull_throwsIllegalArgumentException() {
        RefereePayment payment = RefereePayment.builder().hoursWorked(3).build();

        assertThatThrownBy(payment::validateRefereePayment)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Referee cannot be null");
    }

    @Test
    void refereePayment_validateRefereePayment_hoursWorkedIsZero_throwsIllegalArgumentException() {
        RefereePayment payment = RefereePayment.builder()
                .referee(User.builder().id(UUID.randomUUID()).build())
                .paymentDate(com.soccer.fut7.soccer_system.ValueObject.PaymentDate.of(java.time.LocalDate.now()))
                .hoursWorked(0)
                .build();

        assertThatThrownBy(payment::validateRefereePayment)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Hours worked must be positive");
    }

    @Test
    void refereePayment_validateRefereePayment_amountDoesNotMatchHoursTimesRate_throwsIllegalArgumentException() {
        RefereePayment payment = RefereePayment.builder()
                .referee(User.builder().id(UUID.randomUUID()).build())
                .paymentDate(com.soccer.fut7.soccer_system.ValueObject.PaymentDate.of(java.time.LocalDate.now()))
                .hoursWorked(3)
                .hourlyRate(Money.of(new BigDecimal("100.00")))
                .amount(Money.of(new BigDecimal("999.00"))) // should be 300.00
                .build();

        assertThatThrownBy(payment::validateRefereePayment)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must equal hours worked multiplied by hourly rate");
    }

    @Test
    void refereePayment_validateRefereePayment_amountMatchesHoursTimesRate_doesNotThrow() {
        RefereePayment payment = RefereePayment.builder()
                .referee(User.builder().id(UUID.randomUUID()).build())
                .paymentDate(com.soccer.fut7.soccer_system.ValueObject.PaymentDate.of(java.time.LocalDate.now()))
                .hoursWorked(3)
                .hourlyRate(Money.of(new BigDecimal("100.00")))
                .amount(Money.of(new BigDecimal("300.00")))
                .build();

        assertThatCode(payment::validateRefereePayment).doesNotThrowAnyException();
    }
}
