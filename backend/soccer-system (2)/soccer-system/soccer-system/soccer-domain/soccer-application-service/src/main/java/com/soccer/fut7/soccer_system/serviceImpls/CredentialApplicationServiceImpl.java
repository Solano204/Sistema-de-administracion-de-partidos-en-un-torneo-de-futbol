package com.soccer.fut7.soccer_system.serviceImpls;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CredencialApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerCredential;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CredentialApplicationServiceImpl implements CredencialApplicationService {

    private final CommandHandlerCredential commandHandlerCredential;

    @Override
    public CredentialInfoRecord existCredential(UUID credentialId) {
        return commandHandlerCredential.existCredential(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
    }

    @Override
    public List<CredentialInfoRecord> getAllCredentials() {
        return new ArrayList<>(commandHandlerCredential.getAllCredentials()
                .orElseThrow(() -> new RuntimeException("No credentials found")));
    }

    @Override
    public CredentialInfoRecord saveCredential(Credential credential) {
        return commandHandlerCredential.saveCredential(credential)
                .orElseThrow(() -> new RuntimeException("Failed to save credential"));
    }

    @Override
    public CredentialInfoRecord deleteCredential(UUID credentialId) {
        return commandHandlerCredential.deleteCredential(credentialId)
                .orElseThrow(() -> new RuntimeException("Failed to delete credential"));
    }

    @Override
    public CredentialInfoRecord updateCredential(Credential credential) {
        return commandHandlerCredential.updateCredential(credential)
                .orElseThrow(() -> new RuntimeException("Failed to update credential"));
    }

    @Override
    public List<CredentialInfoRecord> searchCredentialsByName(String name) {
        return new ArrayList<>(commandHandlerCredential.searchCredentialsByName(name)
                .orElseThrow(() -> new RuntimeException("Search failed")));
    }

    @Override
    public List<CredentialInfoRecord> searchCredentialsByNameContaining(String name) {
        return new ArrayList<>(commandHandlerCredential.searchCredentialsByNameContaining(name)
                .orElseThrow(() -> new RuntimeException("Search failed")));
    }
}