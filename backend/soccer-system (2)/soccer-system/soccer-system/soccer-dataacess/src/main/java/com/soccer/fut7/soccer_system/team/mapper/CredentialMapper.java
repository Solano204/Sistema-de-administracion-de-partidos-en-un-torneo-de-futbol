package com.soccer.fut7.soccer_system.team.mapper;

import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.team.entitiy.CredentialEntity;

import org.springframework.context.annotation.Lazy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Lazy
public class CredentialMapper {

    public Credential toDomain(CredentialEntity entity) {
        return Credential.builder()
            .id(entity.getId())
            .playerName(entity.getPlayerName())
            // .transactionDate(entity.getTransactionDate())
            .amount(entity.getAmount())
            .description(entity.getDescription())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
public CredentialEntity toEntity(Credential domain) {
    return CredentialEntity.builder()
        .id(domain.getId())
        .playerName(domain.getPlayerName())
        // .transactionDate(domain.getTransactionDate())
        .amount(domain.getAmount())
        .description(domain.getDescription())
        .createdAt(domain.getCreatedAt())
        .updatedAt(domain.getUpdatedAt())
        .build();
}
   
}