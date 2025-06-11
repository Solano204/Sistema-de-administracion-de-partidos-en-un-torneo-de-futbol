package com.soccer.fut7.soccer_system.rest;

import org.springframework.http.ResponseEntity;
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

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final UserApplicationService userApplicationService;
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userApplicationService.loginUser(loginRequest));
    }

    @PutMapping("/change-password")
    public ResponseEntity<TokenResponse> changePassword(
            @RequestParam String username,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(
            userApplicationService.changePassword(username, currentPassword, newPassword)
        );
    }
    @PutMapping("/change-password/admin")
    public ResponseEntity<TokenResponse> changePassword(
            @RequestParam String username,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(
            userApplicationService.changePasswordWithoutPassword(username, newPassword)
        );
    }

    @PutMapping("/change-username")
    public ResponseEntity<TokenResponse> changeUsername(
            @RequestParam String currentUsername,
            @RequestParam String newUsername,
            @RequestParam String currentPassword) {
        return ResponseEntity.ok(
            userApplicationService.changeUsername(currentUsername, newUsername, currentPassword)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            return ResponseEntity.ok(userApplicationService.refreshToken(refreshRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}