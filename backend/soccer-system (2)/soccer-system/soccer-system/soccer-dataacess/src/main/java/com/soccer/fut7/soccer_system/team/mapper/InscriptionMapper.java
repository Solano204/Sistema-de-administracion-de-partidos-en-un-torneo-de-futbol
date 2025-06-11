package com.soccer.fut7.soccer_system.team.mapper;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;

@Component
@Lazy
public class InscriptionMapper {
    
    public Inscription toDomain(InscriptionEntity entity) {
        return Inscription.builder()
            .id(entity.getId())
            .nameTeam(entity.getNameTeam())
            .numPlayer(entity.getNumPlayer())
            .date(entity.getDate())
            .amount(entity.getAmount())
            // .createdAt(entity.getCreatedAt())
            // .updatedAt(entity.getUpdatedAt())
            .build();
    }
    
    public InscriptionEntity toEntity(Inscription domain) {
        return InscriptionEntity.builder()
            .id(domain.getId())
            .nameTeam(domain.getNameTeam())
            .numPlayer(domain.getNumPlayer())
            .date(domain.getDate())
            .amount(domain.getAmount())
            // .createdAt(domain.getCreatedAt())
            // .updatedAt(domain.getUpdatedAt())
            .build();
    }
}