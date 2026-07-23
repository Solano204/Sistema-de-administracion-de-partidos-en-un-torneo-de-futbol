package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.DtoSecurity.LoginRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.RefreshTokenRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - AuthController's only real logic of
// its own (as opposed to pure delegation) is refreshToken's try/catch, which
// converts ANY exception from the service layer into a 400 rather than
// letting it propagate to GlobalExceptionHandler - these tests pin that
// conversion down specifically, since it's the one place this controller
// makes its own decision rather than just forwarding the service's result.
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private UserApplicationService userApplicationService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(userApplicationService);
    }

    @Test
    void loginUser_delegatesRequestAndReturns200WithTheTokenResponse() {
        LoginRequest request = LoginRequest.builder().username("carlos").password("pw").build();
        TokenResponse response = new TokenResponse();
        when(userApplicationService.loginUser(request)).thenReturn(response);

        ResponseEntity<TokenResponse> result = authController.loginUser(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
    }

    @Test
    void refreshToken_serviceSucceeds_returns200WithTheNewTokenResponse() {
        RefreshTokenRequest request = new RefreshTokenRequest("a-valid-token", UUID.randomUUID());
        TokenResponse response = new TokenResponse();
        when(userApplicationService.refreshToken(request)).thenReturn(response);

        ResponseEntity<TokenResponse> result = authController.refreshToken(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
    }

    @Test
    void refreshToken_serviceThrowsAnyException_returns400InsteadOfPropagatingIt() {
        RefreshTokenRequest request = new RefreshTokenRequest("bad-token", UUID.randomUUID());
        when(userApplicationService.refreshToken(request)).thenThrow(new RuntimeException("Invalid refresh token"));

        ResponseEntity<TokenResponse> result = authController.refreshToken(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(result.getBody()).isNull();
    }

    @Test
    void changePasswordAsAdmin_delegatesUsernameAndNewPasswordOnly() {
        TokenResponse response = new TokenResponse();
        when(userApplicationService.changePasswordWithoutPassword("locked-out-user", "new-pw")).thenReturn(response);

        ResponseEntity<TokenResponse> result = authController.changePasswordAsAdmin("locked-out-user", "new-pw");

        assertThat(result.getBody()).isSameAs(response);
        verify(userApplicationService, never()).changePassword(any(), any(), any());
    }
}
