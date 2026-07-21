package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ports.outport.RefereeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - CommandHelperReferee has no real logic
// of its own for the user-account operations, it's a thin re-router to
// CommandHelperUser filtered to the ARBITRO role (that class's own real
// logic - bootstrap guard, password rules - is covered by
// CommandHelperUserTest). These tests confirm the re-routing itself: right
// method, right arguments, right role filter.
@ExtendWith(MockitoExtension.class)
class CommandHelperRefereeTest {

    @Mock private RefereeRepository refereeRepository;
    @Mock private CommandHelperUser commandHelperUser;

    private CommandHelperReferee commandHelperReferee;

    @BeforeEach
    void setUp() {
        commandHelperReferee = new CommandHelperReferee(refereeRepository, commandHelperUser);
    }

    @Test
    void getAllReferees_delegatesToCommandHelperUserFilteredToArbitroRole() {
        Set<UserDetailsRecordFull> referees = Set.of();
        when(commandHelperUser.getAllUser(UserRole.ARBITRO)).thenReturn(referees);

        assertThat(commandHelperReferee.getAllReferees()).isSameAs(referees);
    }

    @Test
    void insertReferee_delegatesDirectlyToCommandHelperUser() {
        UserRegisterRecord record = new UserRegisterRecord(null, "Ana", "Arbitro", "ana@x.com",
                null, 30, "ana", "pw", "ARBITRO", null);
        TokenResponse response = new TokenResponse();
        when(commandHelperUser.insertUser(record)).thenReturn(response);

        assertThat(commandHelperReferee.insertReferee(record)).isSameAs(response);
    }

    @Test
    void changeStatusReferee_delegatesDirectlyToCommandHelperUser() {
        UUID refereeId = UUID.randomUUID();
        when(commandHelperUser.updateStatusUser(UserStatus.SUSPENDIDO, refereeId)).thenReturn(true);

        assertThat(commandHelperReferee.changeStatusReferee(UserStatus.SUSPENDIDO, refereeId)).isTrue();
    }

    @Test
    void deleteReferee_delegatesDirectlyToRefereeRepositoryNotCommandHelperUser() {
        UUID refereeId = UUID.randomUUID();

        commandHelperReferee.deleteReferee(refereeId);

        verify(refereeRepository).deleteReferee(refereeId);
        verifyNoInteractions(commandHelperUser);
    }
}
