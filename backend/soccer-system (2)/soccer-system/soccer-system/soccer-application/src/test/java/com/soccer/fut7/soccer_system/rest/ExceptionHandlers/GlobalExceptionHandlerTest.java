package com.soccer.fut7.soccer_system.rest.ExceptionHandlers;

import com.soccer.fut7.soccer_system.ExceptionApplication.*;
import com.soccer.fut7.soccer_system.ExceptionApplication.MatchException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests - GlobalExceptionHandler has no Spring-context dependency
// of its own (it's instantiated directly, not via @SpringBootTest), so
// these are as cheap as the pure logic tests elsewhere in this pass, base
// of the pyramid. This is the direct regression suite for the FASE 4/5
// findings from the earlier OpenAPI documentation pass in this session
// (see docs/errors.md / CHANGELOG.md): login failures were 500 instead of
// 401, every other auth failure was 500 instead of 400, PlayerStatsException
// was 500 instead of 404 - all because the exceptions those code paths
// throw had no @ExceptionHandler at all and fell through to the generic
// Exception.class catch-all. These tests pin the fixed mapping down so a
// future edit can't silently regress any of them back to 500.
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private WebRequest webRequest;

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    private void stubPath() {
        when(webRequest.getDescription(false)).thenReturn("uri=/categories/123");
    }

    // ── the exact status-code regression coverage from docs/errors.md ─────

    @Test
    void handleAuthenticationException_badCredentials_returns401() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleAuthenticationException(new BadCredentialsException("Bad credentials"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).containsEntry("message", "Bad credentials");
    }

    @Test
    void handleBadRequestExceptions_userException_returns400NotThe500ItUsedToFallThroughTo() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequestExceptions(new UserException("Current password is incorrect"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleBadRequestExceptions_tokenException_returns400() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleBadRequestExceptions(new TokenException("Invalid refresh token"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void handleNotFoundException_playerStatsException_returns404NotThe500ItUsedToFallThroughTo() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFoundException(new PlayerStatsException("Player not found with ID: 123"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void handleNotFoundException_categoryException_returns404() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFoundException(new categoryException("Category not found"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsEntry("message", "Category not found");
    }

    @Test
    void handleNotFoundException_teamException_returns404() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFoundException(new teamException("Team not found"), webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void handleBadRequestExceptions_everyDomainExceptionInTheGroup_allReturn400() {
        stubPath();
        RuntimeException[] exceptions = {
                new DebtException("x"), new MatchException("x"), new PlayerException("x"),
                new RefereePaymentException("x"), new TournamentException("x"),
        };
        for (RuntimeException ex : exceptions) {
            assertThat(handler.handleBadRequestExceptions(ex, webRequest).getStatusCode())
                    .as("status for %s", ex.getClass().getSimpleName())
                    .isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    // ── validation ──────────────────────────────────────────────────────

    @Test
    void handleValidationExceptions_fieldErrors_mapsEachFieldToItsMessage() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("category", "name", "Category name cannot be empty")
        ));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsEntry("name", "Category name cannot be empty");
    }

    @Test
    void handleValidationExceptions_fieldErrorWithNoDefaultMessage_fallsBackToInvalidValue() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("category", "name", null, false, null, null, null)
        ));

        ResponseEntity<Map<String, Object>> response = handler.handleValidationExceptions(ex);

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertThat(errors).containsEntry("name", "Invalid value");
    }

    // ── the "don't leak raw driver/exception detail" fix ────────────────
    // This whole file already logs every exception server-side (unchanged
    // log.error(...) calls) - what's asserted here is that the *response
    // body* never contains it, which is the actual security-relevant part.

    @Test
    void handleDataIntegrityViolation_foreignKeyViolation_classifiesItNeverLeaksTheRawDriverMessage() {
        stubPath();
        String rawDriverMessage = "ERROR: update or delete on table \"categories\" violates foreign key constraint \"fk_team_category\" on table \"teams\"";
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("wrapper", new RuntimeException(rawDriverMessage));

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("code", "FOREIGN_KEY_VIOLATION");
        assertThat(response.getBody().get("message").toString()).doesNotContain("fk_team_category", "teams", "categories");
    }

    @Test
    void handleDataIntegrityViolation_uniqueConstraintViolation_classifiesItNeverLeaksTheRawDriverMessage() {
        stubPath();
        String rawDriverMessage = "ERROR: duplicate key value violates unique constraint \"users_username_key\"";
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("wrapper", new RuntimeException(rawDriverMessage));

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex, webRequest);

        assertThat(response.getBody()).containsEntry("code", "UNIQUE_CONSTRAINT_VIOLATION");
        assertThat(response.getBody().get("message").toString()).doesNotContain("users_username_key");
    }

    @Test
    void handleDataIntegrityViolation_unrecognizedCause_stillReturns409WithAGenericMessageNoCode() {
        stubPath();
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("wrapper", new RuntimeException("some other constraint failure"));

        ResponseEntity<Map<String, Object>> response = handler.handleDataIntegrityViolation(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).doesNotContainKey("code");
        assertThat(response.getBody().get("message").toString()).doesNotContain("some other constraint failure");
    }

    @Test
    void handleTransactionSystemException_phaseAdvanceError_returns409() {
        stubPath();
        TransactionSystemException ex =
                new TransactionSystemException("wrapper", new RuntimeException("No es posible avanzar de fase"));

        ResponseEntity<Map<String, Object>> response = handler.handleTransactionSystemException(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("code", "PHASE_ADVANCE_ERROR");
    }

    @Test
    void handleTransactionSystemException_otherCause_returns400NeverLeaksTheRawMessage() {
        stubPath();
        String rawMessage = "ERROR: column \"foo\" of relation \"bar\" does not exist";
        TransactionSystemException ex = new TransactionSystemException("wrapper", new RuntimeException(rawMessage));

        ResponseEntity<Map<String, Object>> response = handler.handleTransactionSystemException(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("message").toString()).doesNotContain("relation", "\"bar\"");
    }

    @Test
    void handleDataAccessException_anySubtype_returns503NeverLeaksTheRawMessage() {
        stubPath();
        String rawMessage = "Connection to postgres://prod-db-host:5432/soccerdb refused";
        DataAccessResourceFailureException ex = new DataAccessResourceFailureException(rawMessage);

        ResponseEntity<Map<String, Object>> response = handler.handleDataAccessException(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().get("message").toString()).doesNotContain("prod-db-host", "5432");
    }

    @Test
    void handleAllExceptions_anyUnhandledException_returns500WithAGenericMessageNeverTheRealOne() {
        stubPath();
        Exception ex = new IllegalStateException("NullPointerException at UserRepositoryImpl.java:47, connection pool exhausted");

        ResponseEntity<Map<String, Object>> response = handler.handleAllExceptions(ex, webRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("message", "An unexpected error occurred");
        assertThat(response.getBody().get("message").toString()).doesNotContain("UserRepositoryImpl", "connection pool");
    }

    @Test
    void everyErrorResponse_includesTimestampStatusAndPath_matchingDocsErrorsMd() {
        stubPath();
        ResponseEntity<Map<String, Object>> response =
                handler.handleNotFoundException(new categoryException("not found"), webRequest);

        assertThat(response.getBody())
                .containsKeys("timestamp", "status", "error", "message", "path")
                .containsEntry("path", "/categories/123"); // "uri=" prefix stripped
    }
}
