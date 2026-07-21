package com.soccer.fut7.soccer_system.Configuration;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

// Pure unit test - a real jakarta.validation Validator against a real JwtProperties
// instance, no Spring context needed to exercise the @NotBlank constraint itself.
// Direct regression coverage for this class's own documented fix (see the "Doc 11"
// comment above the class): a missing/blank secretKey must surface as a validation
// violation at startup, not silently bind to null and fail confusingly on first login.
class JwtPropertiesTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    private JwtProperties buildValidProperties() {
        JwtProperties props = new JwtProperties();
        props.setSecretKey("a-valid-non-blank-secret");
        props.setTokenExpirationMs(3_600_000L);
        props.setRefreshExpirationMs(86_400_000L);
        props.setTokenPrefix("Bearer ");
        props.setHeaderName("Authorization");
        props.setAllowedOrigins(new String[]{"http://localhost:3000"});
        return props;
    }

    @Test
    void validate_secretKeyBlank_producesViolationOnSecretKeyField() {
        JwtProperties props = buildValidProperties();
        props.setSecretKey("");

        Set<ConstraintViolation<JwtProperties>> violations = validator.validate(props);

        assertThat(violations)
                .hasSize(1)
                .extracting(v -> v.getPropertyPath().toString())
                .containsExactly("secretKey");
    }

    @Test
    void validate_secretKeyNull_producesViolationMentioningTheEnvVar() {
        JwtProperties props = buildValidProperties();
        props.setSecretKey(null);

        Set<ConstraintViolation<JwtProperties>> violations = validator.validate(props);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessage())
                .contains("APP_SECURITY_JWT_SECRET_KEY");
    }

    @Test
    void validate_secretKeyWhitespaceOnly_producesViolation() {
        JwtProperties props = buildValidProperties();
        props.setSecretKey("   ");

        assertThat(validator.validate(props)).isNotEmpty();
    }

    @Test
    void validate_allFieldsPopulated_noViolations() {
        JwtProperties props = buildValidProperties();

        assertThat(validator.validate(props)).isEmpty();
    }

    @Test
    void gettersAndSetters_roundTripAllFields() {
        JwtProperties props = buildValidProperties();

        assertThat(props.getSecretKey()).isEqualTo("a-valid-non-blank-secret");
        assertThat(props.getTokenExpirationMs()).isEqualTo(3_600_000L);
        assertThat(props.getRefreshExpirationMs()).isEqualTo(86_400_000L);
        assertThat(props.getTokenPrefix()).isEqualTo("Bearer ");
        assertThat(props.getHeaderName()).isEqualTo("Authorization");
        assertThat(props.getAllowedOrigins()).containsExactly("http://localhost:3000");
    }
}
