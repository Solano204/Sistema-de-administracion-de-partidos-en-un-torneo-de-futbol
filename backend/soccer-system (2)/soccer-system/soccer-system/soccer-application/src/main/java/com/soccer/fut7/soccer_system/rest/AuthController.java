package com.soccer.fut7.soccer_system.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.dto.DtoSecurity.LoginRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.RefreshTokenRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Tag(name = "Auth", description = "JWT login/refresh and password/username self-service. Only /login and /refresh are public - see REVIEW_NOTES.md for why every other endpoint here requires a session.")
@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final UserApplicationService userApplicationService;

    @Operation(summary = "Log in", description = "The only place credentials are checked. Returns an access token (short-lived) and a refresh token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(examples = @ExampleObject(value = """
                {
                  "userId": "b3f1a2c4-1234-4a5b-8c9d-000000000099",
                  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
                  "tokenType": "Bearer",
                  "expiresIn": 3600,
                  "username": "admin",
                  "roles": ["ROLE_ADMINISTRADOR"]
                }"""))),
        @ApiResponse(responseCode = "401", description = "Invalid username or password", content = @Content(examples = @ExampleObject(value = """
                { "timestamp": "2026-07-18T12:00:00Z", "status": 401, "error": "Unauthorized", "message": "Bad credentials", "path": "/auth/login" }""")))
    })
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userApplicationService.loginUser(loginRequest));
    }

    // CRITICAL FIX (Doc 1): "/auth/**" used to be entirely permitAll() in
    // SecurityConfig, which made this a self-service "change my own password,
    // I still know my current one" endpoint reachable with no session at
    // all. Requiring isAuthenticated() here is defense in depth on top of
    // the SecurityConfig fix that narrowed the public "/auth/**" surface
    // down to just /login and /refresh.
    @Operation(summary = "Change my own password", description = "Self-service - requires the caller's current password.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password changed, new tokens issued"),
        @ApiResponse(responseCode = "400", description = "currentPassword is wrong, newPassword equals currentPassword, or username does not exist"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/change-password")
    public ResponseEntity<TokenResponse> changePassword(
            @RequestParam String username,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(
            userApplicationService.changePassword(username, currentPassword, newPassword)
        );
    }

    // CRITICAL FIX (Doc 1): this is THE most severe finding in this whole
    // review. This endpoint resets ANY username's password to any value with
    // NO current-password check at all - it exists specifically so an admin
    // can reset a locked-out user's password. With "/auth/**" permitAll()'d
    // (the pre-existing SecurityConfig) and zero @PreAuthorize here, this was
    // reachable by anyone on the internet with no token: PUT
    // /auth/change-password/admin?username=<any>&newPassword=<anything>
    // fully took over any account, including an existing admin's. There is
    // no bootstrap/chicken-and-egg reason for this one to be public the way
    // POST /users has - unlike creating the first admin, resetting an
    // existing user's password always presupposes an admin already exists
    // and is authenticated. hasRole()+hasAuthority() dual check: see the
    // matching comment in UserController.java for why hasRole() alone isn't
    // enough here (CommandHelperTokenProvider issues inconsistent role-claim
    // formats depending on which flow mints the token).
    @Operation(summary = "Admin: reset any user's password", description = "No current-password check by design - this is the admin \"unlock a locked-out account\" path. ADMINISTRADOR only.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset, new tokens issued for that user"),
        @ApiResponse(responseCode = "400", description = "No user exists with that username"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token"),
        @ApiResponse(responseCode = "403", description = "Caller is authenticated but not an ADMINISTRADOR")
    })
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')")
    @PutMapping("/change-password/admin")
    public ResponseEntity<TokenResponse> changePasswordAsAdmin(
            @RequestParam String username,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(
            userApplicationService.changePasswordWithoutPassword(username, newPassword)
        );
    }

    @Operation(summary = "Change my own username", description = "Self-service - requires the caller's current password.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Username changed, new tokens issued"),
        @ApiResponse(responseCode = "400", description = "currentPassword is wrong, or currentUsername does not exist"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/change-username")
    public ResponseEntity<TokenResponse> changeUsername(
            @RequestParam String currentUsername,
            @RequestParam String newUsername,
            @RequestParam String currentPassword) {
        return ResponseEntity.ok(
            userApplicationService.changeUsername(currentUsername, newUsername, currentPassword)
        );
    }

    @Operation(summary = "Refresh an access token", description = "Exchanges a still-valid refresh token for a new access token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "New token pair issued"),
        @ApiResponse(responseCode = "400", description = "Refresh token missing, expired, or invalid")
    })
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            return ResponseEntity.ok(userApplicationService.refreshToken(refreshRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
