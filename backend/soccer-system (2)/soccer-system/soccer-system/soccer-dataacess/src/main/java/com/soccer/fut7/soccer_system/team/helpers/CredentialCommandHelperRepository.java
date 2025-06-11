package com.soccer.fut7.soccer_system.team.helpers;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;
import com.soccer.fut7.soccer_system.team.repository.CredentialRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Lazy
public class CredentialCommandHelperRepository {

    private final CredentialRepositoryData credentialRepositoryData;

    public Optional<CredentialEntity> existCredential(UUID credentialId) {
        return credentialRepositoryData.findById(credentialId);
    }

    public List<CredentialEntity> getAllCredentials() {
        return credentialRepositoryData.findAll();
    }

    public Optional<CredentialEntity> saveCredential(CredentialEntity credential) {
        return Optional.of(credentialRepositoryData.save(credential));
    }

    public Optional<CredentialEntity> deleteCredential(UUID credentialId) {
        Optional<CredentialEntity> existingCredential = credentialRepositoryData.findById(credentialId);
        existingCredential.ifPresent(credential -> credentialRepositoryData.delete(credential));
        return existingCredential;
    }

    public Optional<CredentialEntity> updateCredential(CredentialEntity credential) {
        if (credentialRepositoryData.existsById(credential.getId())) {
            return Optional.of(credentialRepositoryData.save(credential));
        }
        return Optional.empty();
    }

    public List<CredentialEntity> searchCredentialsByName(String name) {
        return credentialRepositoryData.findByPlayerNameContaining(name);
    }

    public List<CredentialEntity> searchCredentialsByNameContaining(String name) {
        return credentialRepositoryData.findByPlayerNameContaining(name);
    }
}