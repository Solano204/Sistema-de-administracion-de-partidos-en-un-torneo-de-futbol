package com.soccer.fut7.soccer_system.Configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

// Doc 11: this had no validation at all - if APP_SECURITY_JWT_SECRET_KEY was
// ever unset, secretKey silently bound to null and the app would start
// successfully, then fail with a confusing NPE/signing error on the first
// login attempt instead of refusing to start. @Validated + @NotBlank makes a
// missing secret a clear startup failure instead, matching how the other
// Next.js projects reviewed this session already fail fast on their
// equivalent session-signing secrets.
@Configuration
@ConfigurationProperties(prefix = "app.security.jwt")
@Validated
public class JwtProperties {
    @NotBlank(message = "app.security.jwt.secret-key (APP_SECURITY_JWT_SECRET_KEY) must be set")
    private String secretKey;
    private long tokenExpirationMs;
    private String tokenPrefix;
    private String headerName;
    private String[] allowedOrigins;
    private long refreshExpirationMs;

    // Getters and Setters
    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public long getTokenExpirationMs() {
        return tokenExpirationMs;
    }

    public void setTokenExpirationMs(long tokenExpirationMs) {
        this.tokenExpirationMs = tokenExpirationMs;
    }

    public String getTokenPrefix() {
        return tokenPrefix;
    }

    public void setTokenPrefix(String tokenPrefix) {
        this.tokenPrefix = tokenPrefix;
    }

    public String getHeaderName() {
        return headerName;
    }

    public void setHeaderName(String headerName) {
        this.headerName = headerName;
    }
    
    public String[] getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
    
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public void setRefreshExpirationMs(long refreshExpirationMs) {
        this.refreshExpirationMs = refreshExpirationMs;
    }
}