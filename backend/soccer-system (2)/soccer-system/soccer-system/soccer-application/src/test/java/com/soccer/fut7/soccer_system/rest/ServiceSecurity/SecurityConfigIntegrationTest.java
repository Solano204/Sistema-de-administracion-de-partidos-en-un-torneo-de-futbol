package com.soccer.fut7.soccer_system.rest.ServiceSecurity;

import com.soccer.fut7.soccer_system.Configuration.JwtProperties;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.ports.input.service.*;
import com.soccer.fut7.soccer_system.rest.*;
import com.soccer.fut7.soccer_system.rest.ExceptionHandlers.JwtAuthenticationEntryPoint;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.Security.CommandHelperTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Integration test for the real authorizeHttpRequests matrix in SecurityConfig,
// exercised over real HTTP through the real filter chain - the single
// highest-value test flagged as not-yet-written in TESTING-STRATEGY.md FASE 7,
// and a direct regression test for the CRITICAL unauthenticated-access
// vulnerability documented in REVIEW_NOTES.md (every UserController/
// AuthController endpoint, plus every other business controller, was
// permitAll()'d before that fix).
//
// Slice, not full @SpringBootTest: @WebMvcTest scoped to exactly the 13 REST
// controllers + the real SecurityConfig/JwtAuthenticationFilter/
// JwtAuthenticationEntryPoint, with every *ApplicationService input port
// @MockBean-stubbed. This deliberately never touches soccer-dataacess, so no
// DataSource/Postgres is needed at all (matching FASE 7's "no real database
// needed" plan) - the JPA layer already has its own (future) test coverage
// scoped separately.
//
// The one piece of real logic this slice can't get from Spring wiring alone:
// JwtAuthenticationFilter delegates token parsing to
// UserApplicationService.DoFilter(...), which is mocked away like every other
// method on that interface. beforeEach stubs DoFilter with a doAnswer that
// replicates CommandHelperUser.handleJwtAuthentication's exact real logic
// (resolveToken -> getAuthentication -> SecurityContextHolder) against a real,
// directly-constructed CommandHelperTokenProvider - so token validation itself
// is genuinely exercised, not faked to just return "authenticated".
@WebMvcTest(controllers = {
        AuthController.class, UserController.class, CategoryController.class,
        CredentialController.class, DebtTeamController.class, DebtPlayerController.class,
        InscriptionController.class, MatchController.class, PlayerController.class,
        RefereePaymentController.class, RefereeController.class, TeamController.class,
        TournamentController.class
})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtAuthenticationEntryPoint.class})
@EnableConfigurationProperties(JwtProperties.class)
@TestPropertySource(properties = {
        "app.security.jwt.secret-key=dGVzdF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X2RvX25vdF91c2VfaW5fcHJvZHVjdGlvbg==",
        "app.security.jwt.token-expiration-ms=3600000",
        "app.security.jwt.refresh-expiration-ms=86400000",
        "app.security.jwt.token-prefix=Bearer ",
        "app.security.jwt.header-name=Authorization"
})
class SecurityConfigIntegrationTest {

    private static final String TEST_SECRET =
            "dGVzdF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X2RvX25vdF91c2VfaW5fcHJvZHVjdGlvbg==";

    @Autowired
    private MockMvc mockMvc;

    @MockBean private UserApplicationService userApplicationService;
    @MockBean private CategoryApplicationService categoryApplicationService;
    @MockBean private CredencialApplicationService credencialApplicationService;
    @MockBean private DebtTeamApplicationService debtTeamApplicationService;
    @MockBean private DebtPlayerApplicationService debtPlayerApplicationService;
    @MockBean private InscriptionApplicationService inscriptionApplicationService;
    @MockBean private MatchApplicationService matchApplicationService;
    @MockBean private PlayerApplicationService playerApplicationService;
    @MockBean private RefereePaymentApplicationService refereePaymentApplicationService;
    @MockBean private RefereeApplicationService refereeApplicationService;
    @MockBean private TeamApplicationService teamApplicationService;
    @MockBean private TournamentApplicationService tournamentApplicationService;

    private CommandHelperTokenProvider tokenProvider;

    @BeforeEach
    void setUp() throws Exception {
        JwtProperties props = new JwtProperties();
        props.setSecretKey(TEST_SECRET);
        props.setTokenExpirationMs(3_600_000L);
        props.setRefreshExpirationMs(86_400_000L);
        props.setTokenPrefix("Bearer ");
        props.setHeaderName("Authorization");
        tokenProvider = new CommandHelperTokenProvider(props);

        // Re-hosts CommandHelperUser.handleJwtAuthentication's exact real body
        // (see that class) against the JwtAuthenticationFilter's mocked
        // UserApplicationService.DoFilter - so real JWT parsing/signature
        // checking runs on every request in this test, it's just invoked
        // directly instead of through the CommandHandlerUser/CommandHelperUser
        // delegation chain (pure pass-through layers already covered by
        // CommandHelperTokenProviderTest and CommandHelperUserTest).
        doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest request = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse response = invocation.getArgument(1);
            String jwt = tokenProvider.resolveToken(request);
            if (jwt != null && !jwt.isBlank()) {
                try {
                    Authentication auth = tokenProvider.getAuthentication(jwt);
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                    return true;
                } catch (Exception e) {
                    org.springframework.security.core.context.SecurityContextHolder.clearContext();
                    response.setStatus(401);
                    return false;
                }
            }
            return false;
        }).when(userApplicationService).DoFilter(any(), any());
    }

    // ROLE_-prefixed token, simulating the registration/photo-update flow
    // (CommandHelperTokenProvider.generateDirectTokenResponse).
    private String bearerTokenDirectFlow(UserRole role) {
        TokenResponse response = tokenProvider.generateDirectTokenResponse(
                UUID.randomUUID(), "test-user", null, role);
        return "Bearer " + response.getAccessToken();
    }

    // Unprefixed-authority token, simulating the normal /auth/login flow
    // (CommandHelperUser.loadUserByUsername builds authorities with no
    // "ROLE_" prefix - see that class's own test for the documented
    // format inconsistency this dual-issues). Exercises the exact case
    // UserController/AuthController's "hasRole()+hasAuthority() dual check"
    // comments say would otherwise silently 403 a real admin who logged in
    // normally.
    private String bearerTokenLoginFlow(UserRole role) {
        UserDetails principal = new User("test-user", "", List.of(new SimpleGrantedAuthority(role.name())));
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        TokenResponse response = tokenProvider.generateTokenResponse(authentication, UUID.randomUUID(), null);
        return "Bearer " + response.getAccessToken();
    }

    // ── Public endpoints: never blocked by the security filter chain ──────
    // A non-401 here proves the request reached the controller/validation
    // layer - the mocked services return null/default, so the exact
    // downstream status (200/400/404) isn't the point, only "not blocked
    // by auth" is.

    @Test
    void publicEndpoints_noToken_noneAreBlockedByAuth() throws Exception {
        record Call(String method, String url, String body) {}
        List<Call> publicCalls = List.of(
                new Call("POST", "/auth/login", """
                        {"username":"carlos","password":"whatever"}"""),
                new Call("POST", "/auth/refresh", """
                        {"refreshToken":"whatever","userId":"%s"}""".formatted(UUID.randomUUID())),
                new Call("POST", "/users", """
                        {"username":"newuser","password":"whatever","role":"USER"}"""),
                new Call("GET", "/users/exist-admin?role=ADMINISTRADOR", null)
        );

        for (Call call : publicCalls) {
            MvcResult result = "GET".equals(call.method())
                    ? mockMvc.perform(get(call.url())).andReturn()
                    : mockMvc.perform(post(call.url())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(call.body())).andReturn();

            assertThat(result.getResponse().getStatus())
                    .as("status for %s %s should never be 401 (public endpoint)", call.method(), call.url())
                    .isNotEqualTo(401);
        }
    }

    // ── The single most severe finding in REVIEW_NOTES.md: dedicated, ─────
    // individually-named regression coverage, not folded into the sweep below.

    @Test
    void putAuthChangePasswordAdmin_noToken_returns401NotPermitAll() throws Exception {
        mockMvc.perform(put("/auth/change-password/admin")
                        .param("username", "anyone")
                        .param("newPassword", "irrelevant"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void putAuthChangePassword_noToken_returns401() throws Exception {
        mockMvc.perform(put("/auth/change-password")
                        .param("username", "carlos")
                        .param("currentPassword", "x")
                        .param("newPassword", "y"))
                .andExpect(status().isUnauthorized());
    }

    // ── Every other business controller: representative sample, one ───────
    // protected endpoint per controller, no token -> 401. This is the direct
    // regression test for REVIEW_NOTES.md's "every UserController/
    // AuthController endpoint... reachable by anyone" finding, extended to
    // confirm the same fix (.anyRequest().authenticated()) actually covers
    // the ~11 other controllers it was meant to cover as a side effect.

    @Test
    void protectedEndpoints_noToken_allReturn401() throws Exception {
        UUID id = UUID.randomUUID();
        record Call(String method, String url) {}
        List<Call> protectedCalls = List.of(
                new Call("GET", "/users?role=ADMINISTRADOR"),
                new Call("DELETE", "/users/" + id),
                new Call("PUT", "/users/" + id),
                new Call("GET", "/users/get-user-details/" + id),
                new Call("GET", "/categories"),
                new Call("GET", "/api/credentials"),
                new Call("GET", "/api/inscriptions"),
                new Call("GET", "/debts/teams/team/" + id),
                new Call("GET", "/debts/players/player/" + id),
                new Call("GET", "/matches/category/" + id),
                new Call("GET", "/players/" + id),
                new Call("GET", "/referee-payments/referee/" + id),
                new Call("GET", "/referees"),
                new Call("GET", "/teams/category/" + id),
                new Call("GET", "/tournaments/matches")
        );

        for (Call call : protectedCalls) {
            MvcResult result = "GET".equals(call.method())
                    ? mockMvc.perform(get(call.url())).andReturn()
                    : mockMvc.perform(delete(call.url())).andReturn();

            assertThat(result.getResponse().getStatus())
                    .as("status for %s %s should be 401 with no token", call.method(), call.url())
                    .isEqualTo(401);
        }
    }

    // ── Authenticated access: proves a valid token actually gets past ─────
    // the filter chain (not just that a missing one gets blocked).

    @Test
    void getUserDetails_anyAuthenticatedRole_isNotBlocked() throws Exception {
        String token = bearerTokenLoginFlow(UserRole.CAPITAN);

        mockMvc.perform(get("/users/get-user-details/" + UUID.randomUUID())
                        .header("Authorization", token))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401));
    }

    @Test
    void getAllUsers_noToken_returns401BeforeAnyRoleCheck() throws Exception {
        mockMvc.perform(get("/users?role=ADMINISTRADOR"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllUsers_authenticatedButNotAdministrador_returns403() throws Exception {
        String token = bearerTokenLoginFlow(UserRole.CAPITAN);

        mockMvc.perform(get("/users?role=ADMINISTRADOR").header("Authorization", token))
                .andExpect(status().isForbidden());
    }

    // ── The documented ROLE_-prefix-vs-not inconsistency, as an actual ─────
    // end-to-end regression: UserController's hasRole()+hasAuthority() dual
    // check must accept an ADMINISTRADOR token from EITHER minting flow.

    @Test
    void getAllUsers_administradorTokenFromDirectFlow_isNotBlockedByRoleCheck() throws Exception {
        String token = bearerTokenDirectFlow(UserRole.ADMINISTRADOR);

        mockMvc.perform(get("/users?role=ADMINISTRADOR").header("Authorization", token))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));
    }

    @Test
    void getAllUsers_administradorTokenFromLoginFlow_isNotBlockedByRoleCheck() throws Exception {
        // This is the exact case the dual hasRole()/hasAuthority() check
        // exists for: a real admin who authenticated through the normal
        // /auth/login path (unprefixed authority claim) must not be 403'd.
        String token = bearerTokenLoginFlow(UserRole.ADMINISTRADOR);

        mockMvc.perform(get("/users?role=ADMINISTRADOR").header("Authorization", token))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));
    }

    @Test
    void deleteUser_noToken_returns401() throws Exception {
        mockMvc.perform(delete("/users/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteUser_authenticatedButNotAdministrador_returns403() throws Exception {
        String token = bearerTokenLoginFlow(UserRole.JUGADOR);

        mockMvc.perform(delete("/users/" + UUID.randomUUID()).header("Authorization", token))
                .andExpect(status().isForbidden());
    }

    @Test
    void tokenSignedWithADifferentSecret_treatedAsUnauthenticated_returns401() throws Exception {
        JwtProperties otherProps = new JwtProperties();
        otherProps.setSecretKey("YW5vdGhlcl90ZXN0X3NlY3JldF9rZXlfZm9yX3Rlc3RpbmdfcHVycG9zZXNfb25seQ==");
        otherProps.setTokenExpirationMs(3_600_000L);
        otherProps.setRefreshExpirationMs(86_400_000L);
        otherProps.setTokenPrefix("Bearer ");
        otherProps.setHeaderName("Authorization");
        CommandHelperTokenProvider otherProvider = new CommandHelperTokenProvider(otherProps);
        String forgedToken = "Bearer " + otherProvider.generateDirectTokenResponse(
                UUID.randomUUID(), "attacker", null, UserRole.ADMINISTRADOR).getAccessToken();

        mockMvc.perform(get("/users?role=ADMINISTRADOR").header("Authorization", forgedToken))
                .andExpect(status().isUnauthorized());
    }
}
