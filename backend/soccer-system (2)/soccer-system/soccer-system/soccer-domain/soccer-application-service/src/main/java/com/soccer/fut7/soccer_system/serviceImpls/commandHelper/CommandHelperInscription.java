package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.mappers.InscriptionMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.InscriptionRepository;

import lombok.AllArgsConstructor;

// Command Helper
@Component
@AllArgsConstructor
public class CommandHelperInscription {
    
    private final InscriptionRepository inscriptionRepository;
    private final InscriptionMapperDomain inscriptionMapper;
    
    public Optional<InscriptionInfoRecord> existInscription(UUID inscriptionId) {
        return inscriptionRepository.existInscription(inscriptionId)
                .map(inscriptionMapper::toInscriptionInfoRecord);
    }
    
    public Optional<List<InscriptionInfoRecord>> getAllInscriptions() {
        return inscriptionRepository.getAllInscriptions()
                .map(inscriptions -> inscriptions.stream()
                        .map(inscriptionMapper::toInscriptionInfoRecord)
                        .collect(Collectors.toList()));
    }
    
    public InscriptionInfoRecord saveInscription(InscriptionInfoRecord inscriptionRecord) {
        Inscription inscription = Inscription.builder()
                .id(inscriptionRecord.id())
                .nameTeam(inscriptionRecord.nameTeam())
                .numPlayer(inscriptionRecord.numPlayer())
                .date(inscriptionRecord.date())
                .amount(inscriptionRecord.amount())
                // .createdAt(LocalDate.now())
                // .updatedAt(LocalDate.now())
                .build();
        
        return inscriptionMapper.toInscriptionInfoRecord(
                inscriptionRepository.saveInscription(inscription)
                        .orElseThrow(() -> new RuntimeException("Failed to save inscription"))
        );
    }
    
    public Optional<List<InscriptionInfoRecord>> getRecentInscriptions() {
        return inscriptionRepository.getRecentInscriptions()
                .map(inscriptions -> inscriptions.stream()
                        .map(inscriptionMapper::toInscriptionInfoRecord)
                        .collect(Collectors.toList()));
    }
    
   
    
    public void deleteInscription(UUID inscriptionId) {
        inscriptionRepository.deleteInscription(inscriptionId);
    }
    
    public Optional<List<InscriptionInfoRecord>> findByTeamName(String teamName) {
        return inscriptionRepository.findByTeamName(teamName)
                .map(inscriptions -> inscriptions.stream()
                        .map(inscriptionMapper::toInscriptionInfoRecord)
                        .collect(Collectors.toList()));
    }
    
    public InscriptionInfoRecord updateInscription(UUID id, InscriptionInfoRecord inscriptionRecord) {
        // Verify inscription exists
        Inscription existingInscription = inscriptionRepository.existInscription(id)
                .orElseThrow(() -> new RuntimeException("Inscription not found for update"));
        
        // Update fields
        Inscription updatedInscription = Inscription.builder()
                .id(id)
                .nameTeam(inscriptionRecord.nameTeam())
                .numPlayer(inscriptionRecord.numPlayer())
                .date(inscriptionRecord.date())
                .amount(inscriptionRecord.amount())
                // .createdAt(existingInscription.getCreatedAt())
                // .updatedAt(LocalDate.now())
                .build();
        
        return inscriptionMapper.toInscriptionInfoRecord(
                inscriptionRepository.updateInscription(updatedInscription)
                        .orElseThrow(() -> new RuntimeException("Failed to update inscription"))
        );
    }
}
