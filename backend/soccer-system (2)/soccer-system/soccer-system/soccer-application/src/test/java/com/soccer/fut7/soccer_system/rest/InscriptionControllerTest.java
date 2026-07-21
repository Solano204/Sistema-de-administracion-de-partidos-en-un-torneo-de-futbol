package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.InscriptionApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - getInscription's null-check-then-404
// is this controller's one real decision (as opposed to pure delegation);
// saveInscription's 201 Created status is also worth pinning down since
// every other write endpoint in this codebase returns 200.
@ExtendWith(MockitoExtension.class)
class InscriptionControllerTest {

    @Mock private InscriptionApplicationService inscriptionApplicationService;

    private InscriptionController inscriptionController;

    @BeforeEach
    void setUp() {
        inscriptionController = new InscriptionController(inscriptionApplicationService);
    }

    @Test
    void getInscription_serviceReturnsInscription_returns200WithIt() {
        UUID id = UUID.randomUUID();
        InscriptionInfoRecord inscription = new InscriptionInfoRecord(id, "Los Tigres", 12, LocalDate.now(), BigDecimal.TEN);
        when(inscriptionApplicationService.existInscription(id)).thenReturn(inscription);

        ResponseEntity<InscriptionInfoRecord> response = inscriptionController.getInscription(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(inscription);
    }

    @Test
    void getInscription_serviceReturnsNull_returns404() {
        UUID id = UUID.randomUUID();
        when(inscriptionApplicationService.existInscription(id)).thenReturn(null);

        ResponseEntity<InscriptionInfoRecord> response = inscriptionController.getInscription(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void saveInscription_returns201CreatedNot200() {
        InscriptionInfoRecord request = new InscriptionInfoRecord(null, "Los Tigres", 12, LocalDate.now(), BigDecimal.TEN);
        InscriptionInfoRecord saved = new InscriptionInfoRecord(UUID.randomUUID(), "Los Tigres", 12, LocalDate.now(), BigDecimal.TEN);
        when(inscriptionApplicationService.saveInscription(request)).thenReturn(saved);

        ResponseEntity<InscriptionInfoRecord> response = inscriptionController.saveInscription(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isSameAs(saved);
    }

    @Test
    void deleteInscription_delegatesThenReturns204NoContent() {
        UUID id = UUID.randomUUID();

        ResponseEntity<Void> response = inscriptionController.deleteInscription(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(inscriptionApplicationService).deleteInscription(id);
    }

    @Test
    void getByTeamName_delegatesDirectlyToTheService() {
        List<InscriptionInfoRecord> results = List.of();
        when(inscriptionApplicationService.findByTeamName("Tigres")).thenReturn(results);

        assertThat(inscriptionController.getByTeamName("Tigres").getBody()).isSameAs(results);
    }
}
