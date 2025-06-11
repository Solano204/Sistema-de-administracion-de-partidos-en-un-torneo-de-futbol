package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;

public interface  CredencialApplicationService {
      // Existing methodspublic interface CredencialApplicationService {
    // Existing methods
    CredentialInfoRecord existCredential(UUID credential);
    List<CredentialInfoRecord> getAllCredentials();
    CredentialInfoRecord saveCredential(Credential credential);

    // Additional methods
    CredentialInfoRecord deleteCredential(UUID credential);
   CredentialInfoRecord updateCredential(Credential credential);
    List<CredentialInfoRecord> searchCredentialsByName(String name);
    List<CredentialInfoRecord> searchCredentialsByNameContaining(String name);
}
