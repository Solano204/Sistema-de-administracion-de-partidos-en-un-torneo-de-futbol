package com.soccer.fut7.soccer_system.ValueObject;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests. Note this VO is imported by User.java but never used as
// an actual field there (a dead import) - grepped, no entity in this
// backend currently has a live PhoneNumber field. Tested anyway since the
// validation logic itself is real and self-contained.
class PhoneNumberTest {

    @Test
    void constructor_nullValue_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new PhoneNumber(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null or empty");
    }

    @Test
    void constructor_blankValue_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new PhoneNumber("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null or empty");
    }

    @Test
    void constructor_tooShort_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new PhoneNumber("12345"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid phone number format");
    }

    @Test
    void constructor_containsLetters_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new PhoneNumber("123-abc-4567"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructor_tenDigits_isValid() {
        PhoneNumber phone = new PhoneNumber("5512345678");

        assertThat(phone.value()).isEqualTo("5512345678");
    }

    @Test
    void constructor_withLeadingPlusAndCountryCode_isValid() {
        PhoneNumber phone = new PhoneNumber("+525512345678");

        assertThat(phone.value()).isEqualTo("+525512345678");
    }

    @Test
    void constructor_sixteenDigits_exceedsMaxLength_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new PhoneNumber("12345678901234567"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
