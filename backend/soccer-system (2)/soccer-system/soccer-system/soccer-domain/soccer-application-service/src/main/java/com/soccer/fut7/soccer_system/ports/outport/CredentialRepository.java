package com.soccer.fut7.soccer_system.ports.outport;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;

public interface CredentialRepository {
    // Existing methods
    Optional<Credential> existCredential(UUID credential);
    Optional<List<Credential>> getAllCredentials();
    Optional<Credential> saveCredential(Credential credential);

    // Additional methods
    Optional<Credential> deleteCredential(UUID credential);
    Optional<Credential> updateCredential(Credential credential);
    Optional<List<Credential>> searchCredentialsByName(String name);
    Optional<List<Credential>> searchCredentialsByNameContaining(String name);
}