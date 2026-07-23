package com.soccer.fut7.soccer_system.serviceImpls.commandHelper.Security;

import com.soccer.fut7.soccer_system.Configuration.JwtProperties;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Pure unit tests - no Spring context, no mocks needed for most of this
// class (it's self-contained JWT build/parse logic against a real
// JwtProperties instance built directly, not injected). This is the base
// of the pyramid for the auth-critical part of this backend.
//
// Naming convention: methodUnderTest_scenario_expectedResult - read a
// failing test name top to bottom and you know exactly which JWT behavior
// broke, without opening the test body.
class CommandHelperTokenProviderTest {

    // Same dev-only test key already used elsewhere in this repo's CI
    // config (application.yaml's default, backend-ci.yml's env var) - not a
    // real secret, just needs to be a valid Base64 string long enough for
    // HS256 (32+ bytes decoded).
    private static final String TEST_SECRET =
            "dGVzdF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X2RvX25vdF91c2VfaW5fcHJvZHVjdGlvbg==";

    private CommandHelperTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecretKey(TEST_SECRET);
        props.setTokenExpirationMs(3_600_000L);
        props.setRefreshExpirationMs(86_400_000L);
        props.setTokenPrefix("Bearer ");
        props.setHeaderName("Authorization");
        tokenProvider = new CommandHelperTokenProvider(props);
    }

    @Test
    void validateToken_tokenFromThisProvider_returnsTrue() {
        // Arrange
        UUID userId = UUID.randomUUID();
        TokenResponse response = tokenProvider.generateDirectTokenResponse(
                userId, "carlos", "photo.jpg", UserRole.ADMINISTRADOR);

        // Act
        boolean valid = tokenProvider.validateToken(response.getAccessToken());

        // Assert
        assertThat(valid).isTrue();
    }

    @Test
    void validateToken_garbageString_returnsFalseNotThrows() {
        assertThat(tokenProvider.validateToken("not-a-real-jwt-at-all")).isFalse();
    }

    @Test
    void validateToken_tokenSignedWithADifferentSecret_returnsFalse() {
        // Arrange - a second provider with a different (but still valid) secret
        JwtProperties otherProps = new JwtProperties();
        otherProps.setSecretKey("YW5vdGhlcl90ZXN0X3NlY3JldF9rZXlfZm9yX3Rlc3RpbmdfcHVycG9zZXNfb25seQ==");
        otherProps.setTokenExpirationMs(3_600_000L);
        otherProps.setRefreshExpirationMs(86_400_000L);
        otherProps.setTokenPrefix("Bearer ");
        otherProps.setHeaderName("Authorization");
        CommandHelperTokenProvider otherProvider = new CommandHelperTokenProvider(otherProps);
        String tokenFromOtherProvider = otherProvider.generateDirectTokenResponse(
                UUID.randomUUID(), "carlos", null, UserRole.ADMINISTRADOR).getAccessToken();

        // Act
        boolean valid = tokenProvider.validateToken(tokenFromOtherProvider);

        // Assert - a token forged/signed with a different key must never validate
        assertThat(valid).isFalse();
    }

    @Test
    void generateDirectTokenResponse_anyRole_prependsRolePrefixToTheAuthorityClaim() {
        // This is the exact behavior documented in AuthController/UserController's
        // "hasRole()+hasAuthority() dual check" comments and REVIEW_NOTES.md: this
        // code path (registration, photo update, admin password reset) prefixes
        // "ROLE_", while loadUserByUsername's normal-login path (see
        // CommandHelperUserTest) does NOT. This test pins down one half of that
        // documented inconsistency so a future refactor can't silently change it
        // without a test failing here.
        TokenResponse response = tokenProvider.generateDirectTokenResponse(
                UUID.randomUUID(), "ana", null, UserRole.ARBITRO);

        assertThat(response.getRoles()).containsExactly("ROLE_ARBITRO");
    }

    @Test
    void generateTokenResponse_authoritiesWithNoPrefix_roundTripsWithNoPrefixAdded() {
        // The other half of the same documented inconsistency: this method
        // (used by the normal /auth/login path) does NOT add a "ROLE_" prefix -
        // it just carries through whatever authorities the Authentication object
        // already has. loadUserByUsername builds those with no prefix (see
        // CommandHelperUserTest#loadUserByUsername_...), so a real login's roles
        // claim ends up unprefixed, unlike generateDirectTokenResponse's.
        UserDetails principal = new User("ana", "", List.of(new SimpleGrantedAuthority("ARBITRO")));
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        UUID userId = UUID.randomUUID();

        TokenResponse response = tokenProvider.generateTokenResponse(authentication, userId, "photo.jpg");

        assertThat(response.getRoles()).containsExactly("ARBITRO");
        assertThat(response.getUserId()).isEqualTo(userId);
    }

    @Test
    void getUserIdFromToken_tokenFromGenerateTokenResponse_roundTripsTheExactUserId() {
        // generateDirectTokenResponse (no userId claim) vs generateTokenResponse
        // (embeds "userId") are genuinely different code paths - this only
        // applies to tokens minted by generateTokenResponse/refreshToken.
        UUID userId = UUID.randomUUID();
        UserDetails principal = new User("ana", "", List.of(new SimpleGrantedAuthority("CAPITAN")));
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());

        TokenResponse response = tokenProvider.generateTokenResponse(authentication, userId, null);
        UUID extracted = tokenProvider.getUserIdFromToken(response.getAccessToken());

        assertThat(extracted).isEqualTo(userId);
    }

    @Test
    void getAuthentication_tokenWithMultipleAuthorities_parsesAllOfThemBack() {
        UserDetails principal = new User(
                "ana", "", List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR"), new SimpleGrantedAuthority("ROLE_BARBER")));
        Authentication original = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = tokenProvider.generateTokenResponse(original, UUID.randomUUID(), null).getAccessToken();

        Authentication parsed = tokenProvider.getAuthentication(token);

        assertThat(parsed.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMINISTRADOR", "ROLE_BARBER");
        assertThat(parsed.getName()).isEqualTo("ana");
    }

    @Test
    void resolveToken_headerPresentWithBearerPrefix_stripsThePrefix() {
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer abc.def.ghi");

        String resolved = tokenProvider.resolveToken(request);

        assertThat(resolved).isEqualTo("abc.def.ghi");
    }

    @Test
    void resolveToken_noAuthorizationHeader_returnsNull() {
        var request = new org.springframework.mock.web.MockHttpServletRequest();

        assertThat(tokenProvider.resolveToken(request)).isNull();
    }
}
