package com.soccer.fut7.soccer_system.dto.DtoSecurity;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Token response DTO

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TokenResponse {
    private UUID userId;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String photoUrl;
    private long expiresIn;
    private String username;
    private String[] roles;

   
}