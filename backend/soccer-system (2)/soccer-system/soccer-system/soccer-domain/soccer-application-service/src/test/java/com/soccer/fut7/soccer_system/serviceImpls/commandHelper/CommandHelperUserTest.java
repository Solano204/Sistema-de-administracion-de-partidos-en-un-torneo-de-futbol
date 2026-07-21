package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ExceptionApplication.TokenException;
import com.soccer.fut7.soccer_system.ExceptionApplication.UserException;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.LoginRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.RefreshTokenRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.mappers.UserMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.UserRepository;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.Security.CommandHelperTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// Classic-pyramid base for this backend's auth-critical logic: real business
// rules (bootstrap admin guard, password verification, token refresh
// validation) live here, isolated from HTTP/Spring wiring via Mockito
// doubles - a fake TransactionManager is used instead of a mock because
// TransactionTemplate needs to actually invoke the callback it's given, not
// just record that a method was called (state, not just interaction).
//
// Naming: methodUnderTest_scenario_expectedResult.
@ExtendWith(MockitoExtension.class)
class CommandHelperUserTest {

    @Mock
    private CommandHelperTokenProvider tokenProvider;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapperDomain userMapper;
    @Mock
    private AuthenticationManager authenticationManager;

    private CommandHelperUser commandHelperUser;

    // A real (not mocked) no-op PlatformTransactionManager - TransactionTemplate
    // needs to actually call the callback it's given, which a bare Mockito mock
    // of PlatformTransactionManager wouldn't do without a lot of extra stubbing.
    private static class NoOpTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) throws TransactionException {
        }

        @Override
        public void rollback(TransactionStatus status) throws TransactionException {
        }
    }

    @BeforeEach
    void setUp() {
        commandHelperUser = new CommandHelperUser(
                tokenProvider, userRepository, passwordEncoder, userMapper, new NoOpTransactionManager());
        commandHelperUser.setAuthenticationManager(authenticationManager);
    }

    private User buildUser(UUID id, String username, String passwordHash, UserRole role, UserStatus status) {
        return User.builder()
                .id(id)
                .credentials(new UserCredentials(username, passwordHash))
                .role(role)
                .status(status)
                .Urlphoto("photo.jpg")
                .build();
    }

    // ── loginUser ────────────────────────────────────────────────────────

    @Test
    void loginUser_authenticationManagerAccepts_returnsTokenResponseFromTokenProvider() {
        // Arrange
        UUID userId = UUID.randomUUID();
        LoginRequest request = LoginRequest.builder().username("carlos").password("correct-password").build();
        User user = buildUser(userId, "carlos", "hashed", UserRole.ADMINISTRADOR, UserStatus.ACTIVO);
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("carlos").password("hashed").authorities("ADMINISTRADOR").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        TokenResponse expectedResponse = new TokenResponse(userId, "access", "refresh", "Bearer", "photo.jpg", 3600, "carlos", new String[]{"ADMINISTRADOR"});

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(tokenProvider.generateTokenResponse(authentication, userId, "photo.jpg")).thenReturn(expectedResponse);

        // Act
        TokenResponse result = commandHelperUser.loginUser(request);

        // Assert
        assertThat(result).isSameAs(expectedResponse);
    }

    @Test
    void loginUser_wrongPassword_authenticationExceptionPropagatesUncaught() {
        // This is the exact behavior GlobalExceptionHandler#handleAuthenticationException
        // depends on to return 401 - loginUser must NOT catch/wrap this itself.
        LoginRequest request = LoginRequest.builder().username("carlos").password("wrong").build();
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> commandHelperUser.loginUser(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ── insertUser: the admin self-registration bootstrap guard ───────────
    // This is REVIEW_NOTES.md's flagged-not-fixed item's one enforced half:
    // ADMINISTRADOR self-registration only ever succeeds once.

    @Test
    void insertUser_noAdminExistsYet_requestingAdministradorRole_succeeds() {
        UserRegisterRecord record = new UserRegisterRecord(null, "Ana", "Admin", "ana@x.com",
                LocalDate.of(1990, 1, 1), 35, "ana", "pw", "ADMINISTRADOR", null);
        User inserted = buildUser(UUID.randomUUID(), "ana", "hashed", UserRole.ADMINISTRADOR, UserStatus.ACTIVO);

        when(userRepository.existAdmin(UserRole.ADMINISTRADOR)).thenReturn(false);
        when(userMapper.buildUserWithEncodedPassword(record)).thenReturn(inserted);
        when(userRepository.insertUser(inserted)).thenReturn(Optional.of(inserted));
        when(tokenProvider.generateDirectTokenResponse(any(), any(), any(), any()))
                .thenReturn(new TokenResponse());

        assertThat(commandHelperUser.insertUser(record)).isNotNull();
    }

    @Test
    void insertUser_adminAlreadyExists_requestingAdministradorRole_throwsUserException() {
        UserRegisterRecord record = new UserRegisterRecord(null, "Ana", "Admin", "ana@x.com",
                LocalDate.of(1990, 1, 1), 35, "ana", "pw", "ADMINISTRADOR", null);

        when(userRepository.existAdmin(UserRole.ADMINISTRADOR)).thenReturn(true);

        assertThatThrownBy(() -> commandHelperUser.insertUser(record))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("Admin already exist");
        verify(userRepository, never()).insertUser(any());
    }

    @Test
    void insertUser_adminAlreadyExists_requestingClientRole_stillSucceeds() {
        // The bootstrap guard is ADMINISTRADOR-specific, by design - this is the
        // exact gap REVIEW_NOTES.md flags (ARBITRO/CAPITAN have no equivalent
        // guard). Documenting the current behavior, not asserting it's correct.
        UserRegisterRecord record = new UserRegisterRecord(null, "Cliente", "X", "c@x.com",
                LocalDate.of(1990, 1, 1), 35, "cliente1", "pw", "USER", null);
        User inserted = buildUser(UUID.randomUUID(), "cliente1", "hashed", UserRole.USER, UserStatus.ACTIVO);

        when(userRepository.existAdmin(UserRole.ADMINISTRADOR)).thenReturn(true);
        when(userMapper.buildUserWithEncodedPassword(record)).thenReturn(inserted);
        when(userRepository.insertUser(inserted)).thenReturn(Optional.of(inserted));
        when(tokenProvider.generateDirectTokenResponse(any(), any(), any(), any()))
                .thenReturn(new TokenResponse());

        assertThat(commandHelperUser.insertUser(record)).isNotNull();
    }

    // ── changePassword: self-service, requires the current password ───────

    @Test
    void changePassword_correctCurrentPasswordAndValidNewPassword_succeeds() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pw", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-password-1")).thenReturn("new-hash");
        when(userRepository.changeUserPassword(eq(user.getId()), eq("carlos"), eq("current-pw"), eq("new-hash")))
                .thenReturn(Optional.of(true));
        when(tokenProvider.generateDirectTokenResponse(any(), any(), any(), any()))
                .thenReturn(new TokenResponse());

        assertThat(commandHelperUser.changePassword("carlos", "current-pw", "new-password-1")).isNotNull();
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsUserExceptionAndNeverWrites() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-guess", "old-hash")).thenReturn(false);

        assertThatThrownBy(() -> commandHelperUser.changePassword("carlos", "wrong-guess", "new-password-1"))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("Current password is incorrect");
        verify(userRepository, never()).changeUserPassword(any(), any(), any(), any());
    }

    @Test
    void changePassword_newPasswordSameAsCurrent_throwsUserException() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("same-password", "old-hash")).thenReturn(true);

        assertThatThrownBy(() -> commandHelperUser.changePassword("carlos", "same-password", "same-password"))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("must be different");
    }

    @Test
    void changePassword_newPasswordTooShort_throwsUserException() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pw", "old-hash")).thenReturn(true);

        assertThatThrownBy(() -> commandHelperUser.changePassword("carlos", "current-pw", "short"))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("at least 8 characters");
    }

    @Test
    void changePassword_userDoesNotExist_throwsUserException() {
        when(userRepository.getUserByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperUser.changePassword("ghost", "x", "y"))
                .isInstanceOf(UserException.class);
    }

    // ── changePasswordWithoutPassword: admin reset, no current-password check ─
    // Direct regression coverage for the most severe finding in REVIEW_NOTES.md.

    @Test
    void changePasswordWithoutPassword_targetUserExists_neverCallsPasswordEncoderMatches() {
        // The whole point of this endpoint is that it does NOT verify a current
        // password - this asserts that stays true (matches() is never even
        // called), not just that the method returns something.
        User user = buildUser(UUID.randomUUID(), "locked-out-user", "old-hash", UserRole.JUGADOR, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("locked-out-user")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password-1")).thenReturn("new-hash");
        when(userRepository.changePasswordWithoutPassword(eq(user.getId()), eq("locked-out-user"), eq("new-hash")))
                .thenReturn(Optional.of(true));
        when(tokenProvider.generateDirectTokenResponse(any(), any(), any(), any()))
                .thenReturn(new TokenResponse());

        commandHelperUser.changePasswordWithoutPassword("locked-out-user", "new-password-1");

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void changePasswordWithoutPassword_targetUserDoesNotExist_throwsUserException() {
        when(userRepository.getUserByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperUser.changePasswordWithoutPassword("ghost", "new-password-1"))
                .isInstanceOf(UserException.class);
    }

    // ── changeUsername ──────────────────────────────────────────────────

    @Test
    void changeUsername_wrongPassword_throwsUserException() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "old-hash")).thenReturn(false);

        assertThatThrownBy(() -> commandHelperUser.changeUsername("carlos", "carlos2", "wrong"))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("Password is incorrect");
    }

    @Test
    void changeUsername_newUsernameAlreadyTaken_throwsUserException() {
        User user = buildUser(UUID.randomUUID(), "carlos", "old-hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-pw", "old-hash")).thenReturn(true);
        when(userRepository.getUserByUsername("taken-name")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> commandHelperUser.changeUsername("carlos", "taken-name", "correct-pw"))
                .isInstanceOf(UserException.class)
                .hasMessageContaining("already taken");
    }

    // ── refreshToken ─────────────────────────────────────────────────────

    @Test
    void refreshToken_invalidToken_throwsTokenException() {
        RefreshTokenRequest request = new RefreshTokenRequest("bad-token", UUID.randomUUID());
        when(tokenProvider.validateToken("bad-token")).thenReturn(false);

        assertThatThrownBy(() -> commandHelperUser.refreshToken(request))
                .isInstanceOf(TokenException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void refreshToken_validTokenButUserIdDoesNotMatchRequest_throwsTokenException() {
        UUID tokenUserId = UUID.randomUUID();
        UUID requestUserId = UUID.randomUUID(); // deliberately different
        RefreshTokenRequest request = new RefreshTokenRequest("good-token", requestUserId);
        when(tokenProvider.validateToken("good-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("good-token")).thenReturn(tokenUserId);

        assertThatThrownBy(() -> commandHelperUser.refreshToken(request))
                .isInstanceOf(TokenException.class)
                .hasMessageContaining("User ID mismatch");
    }

    @Test
    void refreshToken_validTokenAndMatchingUserId_returnsNewTokenResponse() {
        UUID userId = UUID.randomUUID();
        RefreshTokenRequest request = new RefreshTokenRequest("good-token", userId);
        User user = buildUser(userId, "carlos", "hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("carlos").password("hash").authorities("CAPITAN").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        TokenResponse expected = new TokenResponse();

        when(tokenProvider.validateToken("good-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("good-token")).thenReturn(userId);
        when(tokenProvider.getAuthentication("good-token")).thenReturn(authentication);
        when(userRepository.getUserDetails(userId)).thenReturn(Optional.of(user));
        when(tokenProvider.generateTokenResponse(authentication, userId, "photo.jpg")).thenReturn(expected);

        assertThat(commandHelperUser.refreshToken(request)).isSameAs(expected);
    }

    // ── loadUserByUsername: the OTHER half of the role-claim-format ────────
    // inconsistency documented in CommandHelperTokenProviderTest and
    // REVIEW_NOTES.md - this is the code that builds authorities with NO
    // "ROLE_" prefix, for the normal /auth/login path.

    @Test
    void loadUserByUsername_existingUser_buildsAuthorityWithNoRolePrefix() {
        User user = buildUser(UUID.randomUUID(), "carlos", "hash", UserRole.ADMINISTRADOR, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));

        UserDetails details = commandHelperUser.loadUserByUsername("carlos");

        assertThat(details.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ADMINISTRADOR"); // NOT "ROLE_ADMINISTRADOR" - see class comment
    }

    @Test
    void loadUserByUsername_suspendedUser_returnsDisabledUserDetails() {
        User user = buildUser(UUID.randomUUID(), "carlos", "hash", UserRole.CAPITAN, UserStatus.SUSPENDIDO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));

        UserDetails details = commandHelperUser.loadUserByUsername("carlos");

        assertThat(details.isEnabled()).isFalse();
    }

    @Test
    void loadUserByUsername_activeUser_returnsEnabledUserDetails() {
        User user = buildUser(UUID.randomUUID(), "carlos", "hash", UserRole.CAPITAN, UserStatus.ACTIVO);
        when(userRepository.getUserByUsername("carlos")).thenReturn(Optional.of(user));

        UserDetails details = commandHelperUser.loadUserByUsername("carlos");

        assertThat(details.isEnabled()).isTrue();
    }

    @Test
    void loadUserByUsername_userDoesNotExist_throwsUsernameNotFoundException() {
        when(userRepository.getUserByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperUser.loadUserByUsername("ghost"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
