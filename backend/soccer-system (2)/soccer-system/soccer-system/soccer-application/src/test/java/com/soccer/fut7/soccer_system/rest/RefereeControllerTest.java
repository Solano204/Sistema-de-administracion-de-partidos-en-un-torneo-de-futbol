package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.ports.input.service.RefereeApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - RefereeController is pure delegation
// to RefereeApplicationService; real logic underneath (CommandHelperUser's
// bootstrap guard etc.) is already covered by CommandHelperUserTest.
@ExtendWith(MockitoExtension.class)
class RefereeControllerTest {

    @Mock private RefereeApplicationService refereeApplicationService;

    private RefereeController refereeController;

    @BeforeEach
    void setUp() {
        refereeController = new RefereeController(refereeApplicationService);
    }

    @Test
    void getAllReferees_delegatesDirectlyToTheService() {
        Set<UserDetailsRecordFull> referees = Set.of();
        when(refereeApplicationService.getAllReferees()).thenReturn(referees);

        assertThat(refereeController.getAllReferees()).isSameAs(referees);
    }

    @Test
    void insertReferee_delegatesTheRegisterRecordAndReturnsTheTokenResponse() {
        UserRegisterRecord record = new UserRegisterRecord(null, "Ana", "Arbitro", "ana@x.com",
                null, 30, "ana", "pw", "ARBITRO", null);
        TokenResponse response = new TokenResponse();
        when(refereeApplicationService.insertReferee(record)).thenReturn(response);

        assertThat(refereeController.insertReferee(record)).isSameAs(response);
    }

    @Test
    void changeStatusReferee_delegatesStatusAndRefereeIdInThatOrder() {
        UUID refereeId = UUID.randomUUID();
        when(refereeApplicationService.changeStatusReferee(UserStatus.ACTIVO, refereeId)).thenReturn(true);

        assertThat(refereeController.changeStatusReferee(UserStatus.ACTIVO, refereeId)).isTrue();
    }

    @Test
    void deleteReferee_delegatesDirectlyToTheService() {
        UUID refereeId = UUID.randomUUID();

        refereeController.deleteReferee(refereeId);

        verify(refereeApplicationService).deleteReferee(refereeId);
    }
}
