package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests. Same no-null-guard finding as CredentialMapper - see that
// test class's comment for the full explanation; this is the other of the
// two mappers in this package missing the otherwise-universal
// "if (x == null) return null" guard.
class InscriptionMapperTest {

    private final InscriptionMapper inscriptionMapper = new InscriptionMapper();

    @Test
    void toDomain_nullEntity_throwsNullPointerException() {
        assertThatThrownBy(() -> inscriptionMapper.toDomain(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void toEntity_nullDomain_throwsNullPointerException() {
        assertThatThrownBy(() -> inscriptionMapper.toEntity(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void toDomain_allFieldsPresent_mapsEveryField() {
        UUID id = UUID.randomUUID();
        InscriptionEntity entity = InscriptionEntity.builder()
                .id(id)
                .nameTeam("Los Tigres")
                .numPlayer(12)
                .date(LocalDate.of(2026, 3, 1))
                .amount(new BigDecimal("500.00"))
                .build();

        Inscription result = inscriptionMapper.toDomain(entity);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getNameTeam()).isEqualTo("Los Tigres");
        assertThat(result.getNumPlayer()).isEqualTo(12);
        assertThat(result.getAmount()).isEqualByComparingTo("500.00");
    }

    @Test
    void toEntity_allFieldsPresent_mapsEveryField() {
        UUID id = UUID.randomUUID();
        Inscription domain = Inscription.builder()
                .id(id)
                .nameTeam("Los Tigres")
                .numPlayer(12)
                .date(LocalDate.of(2026, 3, 1))
                .amount(new BigDecimal("500.00"))
                .build();

        InscriptionEntity result = inscriptionMapper.toEntity(domain);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getNameTeam()).isEqualTo("Los Tigres");
        assertThat(result.getNumPlayer()).isEqualTo(12);
    }
}
