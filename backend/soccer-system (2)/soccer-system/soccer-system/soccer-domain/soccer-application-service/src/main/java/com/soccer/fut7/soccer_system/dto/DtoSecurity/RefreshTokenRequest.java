package com.soccer.fut7.soccer_system.dto.DtoSecurity;
// Refresh token request DTO

import java.util.UUID;

public class RefreshTokenRequest {
    private String refreshToken;
    private UUID userId;

    // Constructors
    public RefreshTokenRequest() {}

    public RefreshTokenRequest(String refreshToken, UUID userId) {
        this.refreshToken = refreshToken;
        this.userId = userId;
    }

    // Getters and Setters
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}