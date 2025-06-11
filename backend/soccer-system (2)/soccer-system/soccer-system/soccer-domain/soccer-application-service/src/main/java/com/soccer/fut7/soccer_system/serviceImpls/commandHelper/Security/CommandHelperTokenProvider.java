package com.soccer.fut7.soccer_system.serviceImpls.commandHelper.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;

import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.soccer.fut7.soccer_system.Configuration.JwtProperties;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;

import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.crypto.SecretKey;

@AllArgsConstructor
@Component
public class CommandHelperTokenProvider {

    private final JwtProperties jwtProperties;

    public String generateToken(Authentication authentication) {
        return buildToken(authentication, jwtProperties.getTokenExpirationMs());
    }

    public String generateRefreshToken(Authentication authentication) {
        return buildToken(authentication, jwtProperties.getRefreshExpirationMs());
    }

    private String buildToken(Authentication authentication, long expirationMs) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("authorities", getAuthoritiesString(userDetails))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Builds a token directly from username and authorities without requiring
     * authentication
     */
    private String buildTokenDirectly(String username, Collection<? extends GrantedAuthority> authorities,
            long expirationMs) {
        return Jwts.builder()
                .setSubject(username)
                .claim("authorities", authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(",")))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate token response directly from user information without authentication
     */
    public TokenResponse generateDirectTokenResponse(UUID userId, String username, String userPhotoUrl, UserRole role) {
        // Convert UserRole enum to a SimpleGrantedAuthority
        String roleString = "ROLE_" + role.name();
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(roleString));

        String accessToken = buildTokenDirectly(username, authorities, jwtProperties.getTokenExpirationMs());
        String refreshToken = buildTokenDirectly(username, authorities, jwtProperties.getRefreshExpirationMs());

        return new TokenResponse(
                userId,
                accessToken,
                refreshToken,
                jwtProperties.getTokenPrefix().trim(),
                userPhotoUrl,
                jwtProperties.getTokenExpirationMs() / 1000,
                username,
                new String[] { roleString });
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = extractAllClaims(token);
        String username = claims.getSubject();

        List<SimpleGrantedAuthority> authorities = parseAuthorities(claims);
        UserDetails principal = new User(username, "", authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String getAuthoritiesString(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
    }

    private String[] extractRoles(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toArray(String[]::new);
    }

    private List<SimpleGrantedAuthority> parseAuthorities(Claims claims) {
        return Optional.ofNullable(claims.get("authorities", String.class))
                .map(authStr -> Arrays.stream(authStr.split(",")))
                .orElseGet(Stream::empty)
                .map(String::trim)
                .filter(auth -> !auth.isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(jwtProperties.getHeaderName());
        if (StringUtils.hasText(bearerToken)) {
            return bearerToken.substring(jwtProperties.getTokenPrefix().length()).trim();
        }
        return null;
    }

    // Add these methods to your existing CommandHelperTokenProvider class

    /**
     * Extracts the user ID from the token claims
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.get("userId", String.class));
    }

    /**
     * Generates a token response with user ID included in the token
     */
    public TokenResponse generateTokenResponse(Authentication authentication, UUID userId, String userPhotoUrl) {
        String accessToken = buildTokenWithUserId(authentication, userId, jwtProperties.getTokenExpirationMs());
        String refreshToken = buildTokenWithUserId(authentication, userId, jwtProperties.getRefreshExpirationMs());
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return new TokenResponse(
                userId,
                accessToken,
                refreshToken,
                jwtProperties.getTokenPrefix().trim(),
                userPhotoUrl,
                jwtProperties.getTokenExpirationMs() / 1000,
                userDetails.getUsername(),
                extractRoles(userDetails));
    }

    private String buildTokenWithUserId(Authentication authentication, UUID userId, long expirationMs) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("userId", userId.toString()) // Add user ID to claims
                .claim("authorities", getAuthoritiesString(userDetails))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh token method
     */
    public TokenResponse refreshToken(String refreshToken, UUID userId, String userPhotoUrl) throws AuthenticationException {
        if (!validateToken(refreshToken)) {
            throw new AuthenticationException("Invalid refresh token");
        }

        Authentication authentication = getAuthentication(refreshToken);
        return generateTokenResponse(authentication, userId, userPhotoUrl);
    }
}
