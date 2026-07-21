package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context. existAdmin's UserRole.valueOf(role)
// conversion is the one piece of real logic in this controller (as opposed
// to pure delegation) - an invalid role string throws an uncaught
// IllegalArgumentException here, which is worth pinning down explicitly
// since this is a PUBLIC, unauthenticated endpoint (see class/SecurityConfig
// comments) reachable by anyone.
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserApplicationService userApplicationService;

    private UserController userController;

    @BeforeEach
    void setUp() {
        // Field is @Autowired-annotated rather than passed through a
        // constructor parameter list, but @AllArgsConstructor still
        // generates a matching all-fields constructor regardless.
        userController = new UserController(userApplicationService);
    }

    @Test
    void existAdmin_validRoleString_delegatesTheParsedEnumToTheService() {
        when(userApplicationService.existAdmin(UserRole.ADMINISTRADOR)).thenReturn(true);

        assertThat(userController.existAdmin("ADMINISTRADOR")).isTrue();
    }

    @Test
    void existAdmin_garbageRoleString_throwsIllegalArgumentExceptionBeforeCallingTheService() {
        assertThatThrownBy(() -> userController.existAdmin("NOT_A_REAL_ROLE"))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(userApplicationService);
    }

    @Test
    void insertUser_delegatesTheRegisterRecordAndReturnsTheTokenResponseDirectly() {
        UserRegisterRecord record = new UserRegisterRecord(null, "Ana", "Admin", "ana@x.com",
                null, 30, "ana", "pw", "USER", null);
        TokenResponse response = new TokenResponse();
        when(userApplicationService.insertUser(record)).thenReturn(response);

        assertThat(userController.insertUser(record)).isSameAs(response);
    }

    @Test
    void updateStatusUser_delegatesStatusAndUserIdInThatOrder() {
        UUID userId = UUID.randomUUID();
        when(userApplicationService.updateStatusUser(UserStatus.SUSPENDIDO, userId)).thenReturn(true);

        assertThat(userController.updateStatusUser(UserStatus.SUSPENDIDO, userId)).isTrue();
    }

    @Test
    void deleteUser_delegatesDirectlyToTheService() {
        UUID userId = UUID.randomUUID();

        userController.deleteUser(userId);

        verify(userApplicationService).deleteUser(userId);
    }

    @Test
    void getAllUser_delegatesRoleAndReturnsServiceResultUnchanged() {
        Set<UserDetailsRecordFull> users = Set.of();
        when(userApplicationService.getAllUser(UserRole.CAPITAN)).thenReturn(users);

        assertThat(userController.getAllUser(UserRole.CAPITAN)).isSameAs(users);
    }
}
