package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;


import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.mappers.CredentialMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CredentialRepository;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
@AllArgsConstructor
public class CommandHelperCredential {

    private final CredentialRepository credentialRepository;
    private final CredentialMapperDomain credentialMapper;

    public Optional<CredentialInfoRecord> existCredential(UUID credentialId) {
        return credentialRepository.existCredential(credentialId)
                .map(credentialMapper::toCredentialInfoRecord);
    }

    public Optional<Set<CredentialInfoRecord>> getAllCredentials() {
        return credentialRepository.getAllCredentials()
                .map(credentialMapper::credentialListToCredentialInfoRecordSet);
    }

    public Optional<CredentialInfoRecord> saveCredential(Credential credential) {
        return credentialRepository.saveCredential(credential)
                .map(credentialMapper::toCredentialInfoRecord);
    }

    public Optional<CredentialInfoRecord> deleteCredential(UUID credentialId) {
        return credentialRepository.deleteCredential(credentialId)
                .map(credentialMapper::toCredentialInfoRecord);
    }

    public Optional<CredentialInfoRecord> updateCredential(Credential credential) {
        return credentialRepository.updateCredential(credential)
                .map(credentialMapper::toCredentialInfoRecord);
    }

    public Optional<Set<CredentialInfoRecord>> searchCredentialsByName(String name) {
        return credentialRepository.searchCredentialsByName(name)
                .map(credentialMapper::credentialListToCredentialInfoRecordSet);
    }

    public Optional<Set<CredentialInfoRecord>> searchCredentialsByNameContaining(String name) {
        return credentialRepository.searchCredentialsByNameContaining(name)
                .map(credentialMapper::credentialListToCredentialInfoRecordSet);
    }
}
