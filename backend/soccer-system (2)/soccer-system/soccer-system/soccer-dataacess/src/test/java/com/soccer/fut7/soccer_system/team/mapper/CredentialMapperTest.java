package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests.
//
// Found, documented (not changed): unlike every other mapper in this
// package, toDomain/toEntity here have NO null-guard at all - every
// sibling mapper (Category, Team, Player, Match, the *DebtMapper pair,
// RefereePayment, *StatsMapper) starts with "if (x == null) return null".
// This one goes straight to entity.getId()/domain.getId(), so a null
// argument throws NullPointerException instead of returning null. Left
// as-is: this class alone doesn't reveal whether CredentialAdapter (the
// only real caller) ever passes null.
class CredentialMapperTest {

    private final CredentialMapper credentialMapper = new CredentialMapper();

    @Test
    void toDomain_nullEntity_throwsNullPointerExceptionUnlikeEveryOtherMapperInThisPackage() {
        assertThatThrownBy(() -> credentialMapper.toDomain(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void toEntity_nullDomain_throwsNullPointerExceptionUnlikeEveryOtherMapperInThisPackage() {
        assertThatThrownBy(() -> credentialMapper.toEntity(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void toDomain_allFieldsPresent_mapsEveryField() {
        UUID id = UUID.randomUUID();
        CredentialEntity entity = CredentialEntity.builder()
                .id(id)
                .playerName("Carlos")
                .amount(new BigDecimal("100.00"))
                .description("Match fee")
                .createdAt(LocalDate.of(2026, 1, 1))
                .updatedAt(LocalDate.of(2026, 1, 2))
                .build();

        Credential result = credentialMapper.toDomain(entity);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getPlayerName()).isEqualTo("Carlos");
        assertThat(result.getAmount()).isEqualByComparingTo("100.00");
        assertThat(result.getDescription()).isEqualTo("Match fee");
    }

    @Test
    void toEntity_allFieldsPresent_mapsEveryField() {
        UUID id = UUID.randomUUID();
        Credential domain = Credential.builder()
                .id(id)
                .playerName("Carlos")
                .amount(new BigDecimal("100.00"))
                .description("Match fee")
                .createdAt(LocalDate.of(2026, 1, 1))
                .updatedAt(LocalDate.of(2026, 1, 2))
                .build();

        CredentialEntity result = credentialMapper.toEntity(domain);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getPlayerName()).isEqualTo("Carlos");
        assertThat(result.getAmount()).isEqualByComparingTo("100.00");
    }
}
