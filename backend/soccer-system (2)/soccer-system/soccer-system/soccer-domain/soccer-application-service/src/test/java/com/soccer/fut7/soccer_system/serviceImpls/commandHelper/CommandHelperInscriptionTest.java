package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.mappers.InscriptionMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.InscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. Unlike most CommandHelper siblings,
// saveInscription/updateInscription build the domain Inscription directly
// from the record's fields (not via the mapper) - these tests confirm that
// hand-rolled construction actually carries every field through, and that
// updateInscription's existence check runs before it does.
@ExtendWith(MockitoExtension.class)
class CommandHelperInscriptionTest {

    @Mock private InscriptionRepository inscriptionRepository;
    @Mock private InscriptionMapperDomain inscriptionMapper;

    private CommandHelperInscription commandHelperInscription;

    @BeforeEach
    void setUp() {
        commandHelperInscription = new CommandHelperInscription(inscriptionRepository, inscriptionMapper);
    }

    @Test
    void saveInscription_buildsInscriptionFromEveryRecordFieldBeforeSaving() {
        InscriptionInfoRecord record = new InscriptionInfoRecord(
                null, "Los Tigres", 12, LocalDate.of(2026, 1, 1), new BigDecimal("50.00"));
        InscriptionInfoRecord saved = new InscriptionInfoRecord(
                UUID.randomUUID(), "Los Tigres", 12, LocalDate.of(2026, 1, 1), new BigDecimal("50.00"));
        when(inscriptionRepository.saveInscription(any(Inscription.class)))
                .thenAnswer(invocation -> {
                    Inscription built = invocation.getArgument(0);
                    assertThat(built.getNameTeam()).isEqualTo("Los Tigres");
                    assertThat(built.getNumPlayer()).isEqualTo(12);
                    assertThat(built.getAmount()).isEqualByComparingTo("50.00");
                    return Optional.of(built);
                });
        when(inscriptionMapper.toInscriptionInfoRecord(any(Inscription.class))).thenReturn(saved);

        InscriptionInfoRecord result = commandHelperInscription.saveInscription(record);

        assertThat(result).isEqualTo(saved);
    }

    @Test
    void saveInscription_repositoryFailsToSave_throwsRuntimeException() {
        InscriptionInfoRecord record = new InscriptionInfoRecord(null, "Los Tigres", 12, LocalDate.now(), BigDecimal.TEN);
        when(inscriptionRepository.saveInscription(any(Inscription.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperInscription.saveInscription(record))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to save inscription");
    }

    @Test
    void updateInscription_inscriptionDoesNotExist_throwsRuntimeExceptionAndNeverUpdates() {
        UUID id = UUID.randomUUID();
        InscriptionInfoRecord record = new InscriptionInfoRecord(id, "Los Tigres", 12, LocalDate.now(), BigDecimal.TEN);
        when(inscriptionRepository.existInscription(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperInscription.updateInscription(id, record))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
        verify(inscriptionRepository, never()).updateInscription(any());
    }

    @Test
    void getAllInscriptions_repositoryReturnsEmpty_returnsEmptyOptional() {
        when(inscriptionRepository.getAllInscriptions()).thenReturn(Optional.empty());

        assertThat(commandHelperInscription.getAllInscriptions()).isEmpty();
    }

    @Test
    void deleteInscription_delegatesDirectlyToRepository() {
        UUID id = UUID.randomUUID();

        commandHelperInscription.deleteInscription(id);

        verify(inscriptionRepository).deleteInscription(id);
    }
}
