package com.soccer.fut7.soccer_system.mappers;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;

// Domain Mapper
@Component
@Lazy
public class InscriptionMapperDomain {
    
    public InscriptionInfoRecord toInscriptionInfoRecord(Inscription domain) {
        return new InscriptionInfoRecord(
            domain.getId(),
            domain.getNameTeam(),
            domain.getNumPlayer(),
            domain.getDate(),
            domain.getAmount()
            // domain.getCreatedAt(),
            // domain.getUpdatedAt()
        );
    }
}