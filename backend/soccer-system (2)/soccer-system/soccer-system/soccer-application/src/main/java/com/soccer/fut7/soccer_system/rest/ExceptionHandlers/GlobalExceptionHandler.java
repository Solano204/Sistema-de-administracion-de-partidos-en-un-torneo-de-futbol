package com.soccer.fut7.soccer_system.rest.ExceptionHandlers;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.soccer.fut7.soccer_system.ExceptionApplication.*;
import com.soccer.fut7.soccer_system.ExceptionApplication.MatchException;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.error("Validation error: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Validation Error");
        response.put("message", "Validation failed for one or more fields");

        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage() != null 
                                ? fieldError.getDefaultMessage() 
                                : "Invalid value"
                ));

        response.put("errors", errors);

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        log.error("Constraint violation: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Constraint Violation");
        response.put("message", "Invalid request parameters");

        Map<String, String> errors = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        violation -> violation.getMessage()
                ));

        response.put("errors", errors);

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler({
        categoryException.class,
        teamException.class,
        // Doc: Documentation FASE 5 finding - same class of gap as
        // UserException/TokenException above: PlayerStatsException is thrown
        // live (MatchCommandHelperRepository, "Player not found with ID: ...")
        // but had no handler, so it also fell through to the 500 default.
        // CredentialException and RefereeException were checked too - both are
        // imported but never actually thrown anywhere in the codebase (dead
        // code), so they're intentionally left off every group here.
        PlayerStatsException.class
    })
    public ResponseEntity<Map<String, Object>> handleNotFoundException(RuntimeException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler({
        DebtException.class,
        MatchException.class,
        PlayerException.class,
        RefereePaymentException.class,
        TournamentException.class,  // Added TournamentException here
        // Doc: Documentation FASE 4 finding - UserException/TokenException had no
        // dedicated handler at all, so every login/refresh/password/username
        // failure (wrong password, user not found, invalid refresh token, "admin
        // already exists", ...) fell through to handleAllExceptions below and
        // came back as 500 "An unexpected error occurred", which is wrong (it's
        // a client input problem, not a server failure) and made it impossible
        // to write an accurate authentication error doc. UserException covers
        // several distinct real conditions (not-found, conflict, bad credential)
        // under one type with no subtyping, so 400 here is the same coarse-but-
        // correct-direction choice already made for the other domain exceptions
        // in this list - see docs/errors.md for the endpoint-by-endpoint mapping.
        UserException.class,
        TokenException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequestExceptions(RuntimeException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    // Doc: Documentation FASE 4 finding - AuthController#loginUser calls
    // authenticationManager.authenticate(...) directly inside the controller
    // method (not through Spring's UsernamePasswordAuthenticationFilter), so
    // JwtAuthenticationEntryPoint (which only fires for the filter chain, i.e.
    // missing/invalid Bearer token on an already-protected endpoint) never sees
    // a bad-credentials login attempt. Without this handler, BadCredentialsException/
    // DisabledException from a failed login also fell through to
    // handleAllExceptions and returned 500 instead of 401.
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    // Same class of gap as AuthenticationException above: @PreAuthorize("hasRole(...) or
    // hasAuthority(...)") throws AccessDeniedException for an authenticated user with the wrong
    // role, which had no dedicated handler here and fell through to handleAllExceptions,
    // returning 500 instead of 403 for every role-restricted endpoint.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    // Doc 1 FIX: this whole file already logs every exception in full server-
    // side (log.error(...) below, unchanged) - the bug was that it ALSO put
    // the raw exception/root-cause message into the client-facing "details"/
    // "message" field on every one of these handlers, which apply across the
    // entire API (this is a @RestControllerAdvice, not per-route). Postgres
    // constraint-violation and transaction error messages routinely include
    // real table/column/constraint names; handleAllExceptions's ex.getMessage()
    // could leak literally anything an unhandled exception happened to say,
    // for any endpoint. Removed the leaked detail from every response body
    // below; every log.error(...) call was already present and is untouched,
    // so nothing about server-side debuggability got worse.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        log.error("Data integrity violation: {}", ex.getMessage());

        // Extract the most specific cause message
        String rootCause = ex.getMostSpecificCause().getMessage();

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("error", "Data Integrity Violation");
        response.put("message", "Database constraint violation");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        // Special handling for foreign key violations - classification only,
        // never the raw driver message.
        if (rootCause != null && rootCause.contains("violates foreign key constraint")) {
            response.put("message", "Referential integrity violation - referenced entity not found");
            response.put("code", "FOREIGN_KEY_VIOLATION");
        } else if (rootCause != null && rootCause.contains("duplicate key value violates unique constraint")) {
            response.put("message", "Duplicate entry - unique constraint violation");
            response.put("code", "UNIQUE_CONSTRAINT_VIOLATION");
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<Map<String, Object>> handleTransactionSystemException(TransactionSystemException ex, WebRequest request) {
        log.error("Transaction error: {}", ex.getMessage());

        Throwable rootCause = ex.getMostSpecificCause();
        String errorMessage = rootCause.getMessage();

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Transaction Error");
        response.put("message", "Error during database transaction");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        // Special handling for stored procedure errors - classification only.
        if (errorMessage != null && errorMessage.contains("No es posible avanzar")) {
            response.put("message", "Cannot advance to next phase");
            response.put("code", "PHASE_ADVANCE_ERROR");
            response.put("status", HttpStatus.CONFLICT.value());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException ex, WebRequest request) {
        log.error("Data access error: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Data Access Error");
        response.put("message", "Error accessing database");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex, WebRequest request) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        response.put("message", "An unexpected error occurred");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            Exception ex, 
            HttpStatus status,
            WebRequest request) {
        
        log.error("{}: {}", ex.getClass().getSimpleName(), ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return ResponseEntity.status(status).body(response);
    }
}