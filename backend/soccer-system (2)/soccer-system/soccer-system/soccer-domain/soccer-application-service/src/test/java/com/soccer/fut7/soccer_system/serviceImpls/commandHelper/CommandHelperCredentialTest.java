package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.mappers.CredentialMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CredentialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - unlike its CommandHelper siblings,
// CommandHelperCredential never throws on an empty repository result: every
// method just propagates Optional.empty() straight through via .map(...).
// These tests pin down that this class deliberately leaves "not found"
// handling to its caller, rather than deciding an exception itself.
@ExtendWith(MockitoExtension.class)
class CommandHelperCredentialTest {

    @Mock private CredentialRepository credentialRepository;
    @Mock private CredentialMapperDomain credentialMapper;

    private CommandHelperCredential commandHelperCredential;

    @BeforeEach
    void setUp() {
        commandHelperCredential = new CommandHelperCredential(credentialRepository, credentialMapper);
    }

    @Test
    void existCredential_repositoryReturnsEmpty_returnsEmptyOptional() {
        UUID id = UUID.randomUUID();
        when(credentialRepository.existCredential(id)).thenReturn(Optional.empty());

        assertThat(commandHelperCredential.existCredential(id)).isEmpty();
        verifyNoInteractions(credentialMapper);
    }

    @Test
    void existCredential_repositoryReturnsCredential_mapsItThroughTheMapper() {
        UUID id = UUID.randomUUID();
        Credential credential = mock(Credential.class);
        CredentialInfoRecord record = new CredentialInfoRecord(id, null, null, null, null, null);
        when(credentialRepository.existCredential(id)).thenReturn(Optional.of(credential));
        when(credentialMapper.toCredentialInfoRecord(credential)).thenReturn(record);

        assertThat(commandHelperCredential.existCredential(id)).contains(record);
    }

    @Test
    void saveCredential_delegatesToRepositoryThenMapsResult() {
        Credential credential = mock(Credential.class);
        Credential saved = mock(Credential.class);
        CredentialInfoRecord record = new CredentialInfoRecord(UUID.randomUUID(), null, null, null, null, null);
        when(credentialRepository.saveCredential(credential)).thenReturn(Optional.of(saved));
        when(credentialMapper.toCredentialInfoRecord(saved)).thenReturn(record);

        assertThat(commandHelperCredential.saveCredential(credential)).contains(record);
    }

    @Test
    void searchCredentialsByName_repositoryReturnsEmpty_returnsEmptyOptional() {
        when(credentialRepository.searchCredentialsByName("Carlos")).thenReturn(Optional.empty());

        assertThat(commandHelperCredential.searchCredentialsByName("Carlos")).isEmpty();
    }
}
