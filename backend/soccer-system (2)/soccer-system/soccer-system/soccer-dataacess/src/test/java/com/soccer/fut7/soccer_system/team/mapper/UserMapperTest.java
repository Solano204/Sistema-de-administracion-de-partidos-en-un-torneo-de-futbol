package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Pure unit tests - UserMapper implements EntityMapper directly (doesn't
// extend BaseMapper), no ApplicationContext stubbing needed.
class UserMapperTest {

    private final UserMapper userMapper = new UserMapper();

    private User buildDomainUser(UUID id) {
        return User.builder()
                .id(id)
                .personName(new PersonName("Carlos", "Perez"))
                .credentials(new UserCredentials("carlos", "hashed-pw"))
                .role(UserRole.CAPITAN)
                .status(UserStatus.ACTIVO)
                .Urlphoto("photo.png")
                .email("carlos@x.com")
                .birthDate(new BirthDate(LocalDate.of(1995, 6, 1)))
                .age(29)
                .build();
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(userMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_neverCarriesOverAge_unlikeToEntityWithPassword() {
        // Documents a real, findable discrepancy between the two sibling
        // methods: toEntityWithPassword explicitly sets .age(...), toEntity
        // does not - so a caller using the no-password path to persist/
        // update a user silently loses the age value every time, while the
        // password-carrying path does not. Not changed here (unclear from
        // this mapper alone whether every toEntity call site is followed by
        // a separate age-preserving update, which would make this
        // intentional) - documented as current, exact behavior instead.
        User domain = buildDomainUser(UUID.randomUUID());

        UserEntity result = userMapper.toEntity(domain);

        assertThat(result.getAge()).isNull();
    }

    @Test
    void toEntityWithPassword_carriesOverAgeAndThePasswordHash() {
        User domain = buildDomainUser(UUID.randomUUID());

        UserEntity result = userMapper.toEntityWithPassword(domain);

        assertThat(result.getAge()).isEqualTo(29);
        assertThat(result.getPasswordHash()).isEqualTo("hashed-pw");
    }

    @Test
    void toEntity_mapsRoleAndStatusToTheirStringRepresentation() {
        User domain = buildDomainUser(UUID.randomUUID());

        UserEntity result = userMapper.toEntity(domain);

        assertThat(result.getUserRole()).isEqualTo("CAPITAN");
        assertThat(result.getUserStatus()).isEqualTo("ACTIVO");
        assertThat(result.getUsername()).isEqualTo("carlos");
        // toEntity has no passwordHash column set at all - the no-password
        // contract this method's name promises.
        assertThat(result.getPasswordHash()).isNull();
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(userMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_parsesRoleAndStatusBackFromTheirStringForm() {
        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .firstName("Carlos")
                .lastName("Perez")
                .birthDate(LocalDate.of(1995, 6, 1))
                .userRole("ADMINISTRADOR")
                .userStatus("SUSPENDIDO")
                .age(30)
                .email("carlos@x.com")
                .build();

        User result = userMapper.toDomain(entity);

        assertThat(result.getRole()).isEqualTo(UserRole.ADMINISTRADOR);
        assertThat(result.getStatus()).isEqualTo(UserStatus.SUSPENDIDO);
        assertThat(result.getPersonName().firstName()).isEqualTo("Carlos");
    }

    @Test
    void toDomainWithPassword_carriesOverCredentialsIncludingThePasswordHash() {
        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .firstName("Carlos")
                .lastName("Perez")
                .birthDate(LocalDate.of(1995, 6, 1))
                .username("carlos")
                .passwordHash("hashed-pw")
                .userRole("CAPITAN")
                .userStatus("ACTIVO")
                .build();

        User result = userMapper.toDomainWithPassword(entity);

        assertThat(result.getCredentials().username()).isEqualTo("carlos");
        assertThat(result.getCredentials().passwordHash()).isEqualTo("hashed-pw");
    }
}
