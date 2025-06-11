package com.soccer.fut7.soccer_system.team.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.hibernate.query.Page;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;
import com.soccer.fut7.soccer_system.ports.outport.InscriptionRepository;
import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;
import com.soccer.fut7.soccer_system.team.helpers.InscriptionCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.InscriptionMapper;

import lombok.AllArgsConstructor;

// Adapter (Infrastructure Layer)
@Component
@AllArgsConstructor
@Lazy
public class InscriptionAdapter implements InscriptionRepository {
    
    private final InscriptionCommandHelperRepository inscriptionCommandHelperRepository;
    private final InscriptionMapper inscriptionMapper;
    
    @Override
    public Optional<Inscription> existInscription(UUID inscriptionId) {
        return inscriptionCommandHelperRepository.existInscription(inscriptionId)
            .map(inscriptionMapper::toDomain);
    }
    
    @Override
    public Optional<List<Inscription>> getAllInscriptions() {
        return Optional.of(
            inscriptionCommandHelperRepository.getAllInscriptions()
                .stream()
                .map(inscriptionMapper::toDomain)
                .collect(Collectors.toList())
        );
    }
    
    @Override
    public Optional<Inscription> saveInscription(Inscription inscription) {
        InscriptionEntity entity = inscriptionMapper.toEntity(inscription);
        InscriptionEntity savedEntity = inscriptionCommandHelperRepository.saveInscription(entity);
        return Optional.of(inscriptionMapper.toDomain(savedEntity));
    }
    
    @Override
    public Optional<List<Inscription>> getRecentInscriptions() {
        return Optional.of(
            inscriptionCommandHelperRepository.getRecentInscriptions()
                .stream()
                .map(inscriptionMapper::toDomain)
                .collect(Collectors.toList())
        );
    }
    
   
    
    @Override
    public void deleteInscription(UUID inscriptionId) {
        inscriptionCommandHelperRepository.deleteInscription(inscriptionId);
    }
    
    @Override
    public Optional<List<Inscription>> findByTeamName(String teamName) {
        return Optional.of(
            inscriptionCommandHelperRepository.findByTeamName(teamName)
                .stream()
                .map(inscriptionMapper::toDomain)
                .collect(Collectors.toList())
        );
    }
    
    @Override
    public Optional<Inscription> updateInscription(Inscription inscription) {
        InscriptionEntity entity = inscriptionMapper.toEntity(inscription);
        InscriptionEntity updatedEntity = inscriptionCommandHelperRepository.updateInscription(entity);
        return Optional.of(inscriptionMapper.toDomain(updatedEntity));
    }
}