package com.soccer.fut7.soccer_system.team.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.ports.outport.CredentialRepository;
import com.soccer.fut7.soccer_system.team.helpers.CredentialCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.CredentialMapper;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Component
@AllArgsConstructor
@Lazy
public class CredentialAdapter implements CredentialRepository {

    private final CredentialCommandHelperRepository credentialCommandHelperRepository;
    private final CredentialMapper credentialMapper;

    @Override
    public Optional<Credential> existCredential(UUID credential) {
        return credentialCommandHelperRepository.existCredential(credential)
            .map(credentialMapper::toDomain);
    }

    @Override
    public Optional<List<Credential>> getAllCredentials() {
        return Optional.of(
            credentialCommandHelperRepository.getAllCredentials().stream()
                .map(credentialMapper::toDomain)
                .collect(Collectors.toList())
        );
    }

    @Override
    public Optional<Credential> saveCredential(Credential credential) {
        return credentialCommandHelperRepository.saveCredential(credentialMapper.toEntity(credential))
            .map(credentialMapper::toDomain);
    }

    @Override
    public Optional<Credential> deleteCredential(UUID credential) {
        return credentialCommandHelperRepository.deleteCredential(credential)
            .map(credentialMapper::toDomain);
    }

    @Override
    public Optional<Credential> updateCredential(Credential credential) {
        return credentialCommandHelperRepository.updateCredential(credentialMapper.toEntity(credential))
            .map(credentialMapper::toDomain);
    }

    @Override
    public Optional<List<Credential>> searchCredentialsByName(String name) {
        return Optional.of(
            credentialCommandHelperRepository.searchCredentialsByName(name).stream()
                .map(credentialMapper::toDomain)
                .collect(Collectors.toList())
        );
    }

    @Override
    public Optional<List<Credential>> searchCredentialsByNameContaining(String name) {
        return Optional.of(
            credentialCommandHelperRepository.searchCredentialsByNameContaining(name).stream()
                .map(credentialMapper::toDomain)
                .collect(Collectors.toList())
        );
    }
}