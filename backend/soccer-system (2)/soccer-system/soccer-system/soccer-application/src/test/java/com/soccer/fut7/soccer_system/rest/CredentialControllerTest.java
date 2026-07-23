package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CredencialApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - this controller has the most
// null-check-then-status branching of any controller in this codebase
// (get/create/update/delete all translate a null service result into
// 404/400 rather than always returning 200), plus a real ternary in
// searchCredentialsByName choosing between an exact and a substring match.
// All of that is exercised here; CommandHelperCredentialTest already covers
// the mapping logic underneath.
@ExtendWith(MockitoExtension.class)
class CredentialControllerTest {

    @Mock private CredencialApplicationService credentialApplicationService;

    private CredentialController credentialController;

    @BeforeEach
    void setUp() {
        credentialController = new CredentialController(credentialApplicationService);
    }

    @Test
    void getCredential_serviceReturnsCredential_returns200WithIt() {
        UUID id = UUID.randomUUID();
        CredentialInfoRecord credential = new CredentialInfoRecord(id, "Carlos", null, null, null, null);
        when(credentialApplicationService.existCredential(id)).thenReturn(credential);

        ResponseEntity<CredentialInfoRecord> response = credentialController.getCredential(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(credential);
    }

    @Test
    void getCredential_serviceReturnsNull_returns404() {
        UUID id = UUID.randomUUID();
        when(credentialApplicationService.existCredential(id)).thenReturn(null);

        assertThat(credentialController.getCredential(id).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void createCredential_serviceSaves_returns200WithTheResult() {
        Credential credential = mock(Credential.class);
        CredentialInfoRecord saved = new CredentialInfoRecord(UUID.randomUUID(), "Carlos", null, null, null, null);
        when(credentialApplicationService.saveCredential(credential)).thenReturn(saved);

        ResponseEntity<CredentialInfoRecord> response = credentialController.createCredential(credential);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(saved);
    }

    @Test
    void createCredential_serviceReturnsNull_returns400() {
        Credential credential = mock(Credential.class);
        when(credentialApplicationService.saveCredential(credential)).thenReturn(null);

        assertThat(credentialController.createCredential(credential).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateCredential_forcesThePathIdOntoTheCredentialBeforeSaving() {
        UUID pathId = UUID.randomUUID();
        Credential credential = mock(Credential.class);
        when(credentialApplicationService.updateCredential(credential))
                .thenReturn(new CredentialInfoRecord(pathId, "Carlos", null, null, null, null));

        credentialController.updateCredential(pathId, credential);

        verify(credential).setId(pathId);
    }

    @Test
    void updateCredential_serviceReturnsNull_returns404() {
        UUID pathId = UUID.randomUUID();
        Credential credential = mock(Credential.class);
        when(credentialApplicationService.updateCredential(credential)).thenReturn(null);

        assertThat(credentialController.updateCredential(pathId, credential).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteCredential_serviceReturnsNull_returns404() {
        UUID id = UUID.randomUUID();
        when(credentialApplicationService.deleteCredential(id)).thenReturn(null);

        assertThat(credentialController.deleteCredential(id).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ── searchCredentialsByName: the containing=true/false ternary ─────────

    @Test
    void searchCredentialsByName_containingTrue_callsTheSubstringSearch() {
        List<CredentialInfoRecord> results = List.of();
        when(credentialApplicationService.searchCredentialsByNameContaining("carl")).thenReturn(results);

        assertThat(credentialController.searchCredentialsByName("carl", true).getBody()).isSameAs(results);
        verify(credentialApplicationService, never()).searchCredentialsByName(any());
    }

    @Test
    void searchCredentialsByName_containingFalse_callsTheExactSearch() {
        List<CredentialInfoRecord> results = List.of();
        when(credentialApplicationService.searchCredentialsByName("Carlos")).thenReturn(results);

        assertThat(credentialController.searchCredentialsByName("Carlos", false).getBody()).isSameAs(results);
        verify(credentialApplicationService, never()).searchCredentialsByNameContaining(any());
    }
}
