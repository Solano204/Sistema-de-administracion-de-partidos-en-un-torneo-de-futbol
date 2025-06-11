package com.soccer.fut7.soccer_system.mappers;


import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;

import org.springframework.context.annotation.Lazy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Lazy
public class CredentialMapperDomain  {


    public CredentialInfoRecord toCredentialInfoRecord(Credential domain) {
        return new CredentialInfoRecord(
            domain.getId(),
            domain.getPlayerName(),
            // domain.getTransactionDate(),
            domain.getAmount(),
            domain.getDescription(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    public Set<CredentialInfoRecord> credentialListToCredentialInfoRecordSet(List<Credential> credentials) {
        return credentials.stream()
            .map(this::toCredentialInfoRecord)
            .collect(Collectors.toSet());
    }
}