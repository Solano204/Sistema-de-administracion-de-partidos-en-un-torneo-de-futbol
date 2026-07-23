package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.helpers.UserCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated.
//
// Found, not fixed - confirmed DEAD code, not a live vulnerability: this
// interface's own loginUser is never called anywhere in
// soccer-application-service (grepped the whole module) - the real login
// flow goes through CommandHelperUser.loginUser, which uses Spring
// Security's AuthenticationManager instead. If it WERE ever wired up, it
// would be permanently broken: it chains two .filter()s, and the second one
// compares the raw plaintext password against the stored BCrypt hash via
// String#equals(), which can never be true - loginUser_correctCredentials_
// stillReturnsEmptyBecauseOfTheSecondFilter below pins this down explicitly
// so it's documented as a known trap, not silently "discovered" again later
// if someone ever tries to wire this method up.
//
// Also found: changeUserPassword's second .filter() computes
// user.getPasswordHash().equals(currentPassword) and then throws the result
// away, unconditionally returning true - a complete no-op, functionally
// identical to not having that filter at all.
//
// NOT a plaintext-password bug (verified against CommandHelperUserTest):
// changeUserPassword/changePasswordWithoutPassword skip re-encoding
// newPassword (the passwordEncoder.encode(...) call is commented out) -
// this is correct, not a gap, because CommandHelperUser (the only real
// caller) already encodes the password BEFORE calling into this layer, so
// by the time newPassword arrives here it's already a BCrypt hash, not
// plaintext. Encoding it again would double-hash it. Pinned down as an
// explicit contract test below.
@ExtendWith(MockitoExtension.class)
class UserAdapterTest {

    @Mock private UserCommandHelperRepository userCommandHelperRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;

    private UserAdapter userAdapter;

    @BeforeEach
    void setUp() {
        userAdapter = new UserAdapter(userCommandHelperRepository, userMapper, passwordEncoder);
    }

    // ── loginUser: confirmed-dead, confirmed-broken ─────────────────────────

    @Test
    void loginUser_correctCredentials_stillReturnsEmptyBecauseOfTheSecondFilter() {
        UserEntity user = UserEntity.builder().id(UUID.randomUUID()).username("carlos").passwordHash("$2a$12$hashedvalue").build();
        when(userCommandHelperRepository.findByUsername("carlos")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "$2a$12$hashedvalue")).thenReturn(true);

        Optional<User> result = userAdapter.loginUser("carlos", "correct-password");

        assertThat(result).isEmpty(); // the bug: a hash can never .equals() the plaintext it came from
        verifyNoInteractions(userMapper);
    }

    // ── changeUserPassword: the no-op second filter + the encode contract ──

    @Test
    void changeUserPassword_wrongCurrentPassword_returnsFalseWithoutCallingUpdatePassword() {
        UUID userId = UUID.randomUUID();
        UserEntity user = UserEntity.builder().id(userId).passwordHash("$2a$12$hashedvalue").build();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$12$hashedvalue")).thenReturn(false);

        Optional<Boolean> result = userAdapter.changeUserPassword(userId, "carlos", "wrong", "new-hash");

        assertThat(result).contains(false);
        verify(userCommandHelperRepository, never()).updatePassword(any(), any());
    }

    @Test
    void changeUserPassword_correctCurrentPassword_passesTheNewPasswordThroughWithoutReEncodingIt() {
        // Confirms the "already encoded by the caller" contract: whatever
        // string is passed as newPassword reaches updatePassword byte-for-byte
        // unchanged - passwordEncoder.encode is never invoked in this method.
        UUID userId = UUID.randomUUID();
        UserEntity user = UserEntity.builder().id(userId).passwordHash("$2a$12$oldhash").build();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current-pw", "$2a$12$oldhash")).thenReturn(true);
        when(userCommandHelperRepository.updatePassword(userId, "$2a$12$already-encoded-new-hash"))
                .thenReturn(Optional.of(true));

        Optional<Boolean> result = userAdapter.changeUserPassword(userId, "carlos", "current-pw", "$2a$12$already-encoded-new-hash");

        assertThat(result).contains(true);
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void changeUserPassword_userDoesNotExist_returnsFalse() {
        UUID userId = UUID.randomUUID();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.empty());

        assertThat(userAdapter.changeUserPassword(userId, "carlos", "x", "y")).contains(false);
    }

    // ── updateBasicInformation: field-by-field partial update ──────────────

    @Test
    void updateBasicInformation_userDoesNotExist_throwsIllegalArgumentException() {
        UUID userId = UUID.randomUUID();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userAdapter.updateBasicInformation(userId, User.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(userId.toString());
    }

    @Test
    void updateBasicInformation_onlyEmailProvided_leavesFirstNameLastNameAgeUnchanged() {
        UUID userId = UUID.randomUUID();
        UserEntity existing = UserEntity.builder().id(userId).firstName("Carlos").lastName("Perez").age(30).build();
        User partialUpdate = User.builder().email("new@x.com").build();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.of(existing));
        when(userCommandHelperRepository.updateUser(existing)).thenReturn(Optional.of(existing));

        userAdapter.updateBasicInformation(userId, partialUpdate);

        assertThat(existing.getFirstName()).isEqualTo("Carlos");
        assertThat(existing.getLastName()).isEqualTo("Perez");
        assertThat(existing.getAge()).isEqualTo(30);
        assertThat(existing.getEmail()).isEqualTo("new@x.com");
    }

    @Test
    void updateBasicInformation_emptyStringFirstName_isTreatedAsAbsentNotAsAClear() {
        UUID userId = UUID.randomUUID();
        UserEntity existing = UserEntity.builder().id(userId).firstName("Carlos").build();
        User update = User.builder().personName(new PersonName("", "Perez")).build();
        when(userCommandHelperRepository.getUser(userId)).thenReturn(Optional.of(existing));
        when(userCommandHelperRepository.updateUser(existing)).thenReturn(Optional.of(existing));

        userAdapter.updateBasicInformation(userId, update);

        assertThat(existing.getFirstName()).isEqualTo("Carlos"); // NOT overwritten with ""
    }

    // ── getAllUser: empty list becomes Optional.empty(), not Optional.of(empty) ─

    @Test
    void getAllUser_noUsersForThatRole_returnsOptionalEmptyNotAnEmptyList() {
        when(userCommandHelperRepository.getAllUserByRole(UserRole.ARBITRO)).thenReturn(List.of());

        assertThat(userAdapter.getAllUser(UserRole.ARBITRO)).isEmpty();
        verifyNoInteractions(userMapper);
    }

    @Test
    void getAllUser_usersExist_returnsThemMappedWithPassword() {
        UserEntity entity = UserEntity.builder().id(UUID.randomUUID()).build();
        User mapped = User.builder().id(entity.getId()).build();
        when(userCommandHelperRepository.getAllUserByRole(UserRole.ARBITRO)).thenReturn(List.of(entity));
        when(userMapper.toDomainWithPassword(entity)).thenReturn(mapped);

        assertThat(userAdapter.getAllUser(UserRole.ARBITRO)).contains(List.of(mapped));
    }
}
