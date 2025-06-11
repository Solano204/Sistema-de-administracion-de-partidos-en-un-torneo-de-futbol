package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperCredential;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
@AllArgsConstructor
public class CommandHandlerCredential {

    private final CommandHelperCredential commandHelperCredential;

    public Optional<CredentialInfoRecord> existCredential(UUID credentialId) {
        return commandHelperCredential.existCredential(credentialId);
    }

    public Optional<Set<CredentialInfoRecord>> getAllCredentials() {
        return commandHelperCredential.getAllCredentials();
    }

    public Optional<CredentialInfoRecord> saveCredential(Credential credential) {
        return commandHelperCredential.saveCredential(credential);
    }

    public Optional<CredentialInfoRecord> deleteCredential(UUID credentialId) {
        return commandHelperCredential.deleteCredential(credentialId);
    }

    public Optional<CredentialInfoRecord> updateCredential(Credential credential) {
        return commandHelperCredential.updateCredential(credential);
    }

    public Optional<Set<CredentialInfoRecord>> searchCredentialsByName(String name) {
        return commandHelperCredential.searchCredentialsByName(name);
    }

    public Optional<Set<CredentialInfoRecord>> searchCredentialsByNameContaining(String name) {
        return commandHelperCredential.searchCredentialsByNameContaining(name);
    }
}