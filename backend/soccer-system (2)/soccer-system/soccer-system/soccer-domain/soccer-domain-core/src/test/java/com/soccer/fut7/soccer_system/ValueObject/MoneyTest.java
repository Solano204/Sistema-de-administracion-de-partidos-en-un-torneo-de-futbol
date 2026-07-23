package com.soccer.fut7.soccer_system.ValueObject;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Currency;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests. Money's compact constructor has three real, non-obvious
// behaviors worth pinning down precisely, since every mapper that touches
// currency (PlayerDebtMapper/TeamDebtMapper/RefereePaymentMapper, see
// TESTING-STRATEGY.md pass 4) depends on this exact behavior:
// 1. The passed-in `currency` argument is completely IGNORED - every Money
//    is always MXN, regardless of what's requested or what a persisted
//    entity's currency column actually says.
// 2. Negative amounts are rejected.
// 3. More than 2 decimal places get silently rounded (HALF_EVEN), not
//    rejected.
class MoneyTest {

    @Test
    void constructor_anyRequestedCurrency_isSilentlyOverriddenToMXN() {
        Money money = new Money(BigDecimal.TEN, Currency.getInstance("USD"));

        assertThat(money.currency()).isEqualTo(Currency.getInstance("MXN"));
    }

    @Test
    void constructor_nullAmount_throwsNullPointerException() {
        assertThatThrownBy(() -> new Money(null, Currency.getInstance("MXN")))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Amount cannot be null");
    }

    @Test
    void constructor_negativeAmount_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new Money(new BigDecimal("-1.00"), Currency.getInstance("MXN")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be negative");
    }

    @Test
    void constructor_zeroAmount_isAllowed() {
        Money money = new Money(BigDecimal.ZERO, Currency.getInstance("MXN"));

        assertThat(money.amount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void constructor_moreThanTwoDecimalPlaces_roundsRatherThanRejects() {
        Money money = new Money(new BigDecimal("10.005"), Currency.getInstance("MXN"));

        assertThat(money.amount()).isEqualByComparingTo("10.00"); // HALF_EVEN: 10.005 -> 10.00
        assertThat(money.amount().scale()).isEqualTo(2);
    }

    @Test
    void add_twoAmounts_sumsCorrectly() {
        Money five = Money.of(new BigDecimal("5.00"));
        Money three = Money.of(new BigDecimal("3.00"));

        assertThat(five.add(three).amount()).isEqualByComparingTo("8.00");
    }

    @Test
    void subtract_resultWouldBeNegative_throwsIllegalArgumentException() {
        Money three = Money.of(new BigDecimal("3.00"));
        Money five = Money.of(new BigDecimal("5.00"));

        assertThatThrownBy(() -> three.subtract(five)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void multiply_negativeMultiplier_throwsIllegalArgumentException() {
        Money ten = Money.of(BigDecimal.TEN);

        assertThatThrownBy(() -> ten.multiply(-1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void multiply_positiveMultiplier_scalesCorrectly() {
        Money ten = Money.of(BigDecimal.TEN);

        assertThat(ten.multiply(3.5).amount()).isEqualByComparingTo("35.00");
    }
}
