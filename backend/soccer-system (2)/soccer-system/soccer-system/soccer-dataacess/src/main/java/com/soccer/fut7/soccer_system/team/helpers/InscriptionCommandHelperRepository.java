package com.soccer.fut7.soccer_system.team.helpers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.hibernate.query.Page;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Sort;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.entitiy.InscriptionEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.repository.InscriptionRepositoryData;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

// Repository Helper
@Component
@RequiredArgsConstructor
@Lazy
public class InscriptionCommandHelperRepository {
    
    private final InscriptionRepositoryData inscriptionRepositoryData;
    
    public Optional<InscriptionEntity> existInscription(UUID inscriptionId) {
        return inscriptionRepositoryData.findById(inscriptionId);
    }
    
    public List<InscriptionEntity> getAllInscriptions() {
        return inscriptionRepositoryData.findAll();
    }
    
    public InscriptionEntity saveInscription(InscriptionEntity entity) {
        return inscriptionRepositoryData.save(entity);
    }
    
    public List<InscriptionEntity> getRecentInscriptions() {
        return inscriptionRepositoryData.findTop10ByOrderByDateDesc();
    }
    
    
    
    public void deleteInscription(UUID inscriptionId) {
        inscriptionRepositoryData.deleteById(inscriptionId);
    }
    
    public List<InscriptionEntity> findByTeamName(String teamName) {
        return inscriptionRepositoryData.findByNameTeamContainingIgnoreCase(teamName);
    }
    
    public InscriptionEntity updateInscription(InscriptionEntity entity) {
        // Check if the entity exists
        inscriptionRepositoryData.findById(entity.getId())
            .orElseThrow(() -> new RuntimeException("Inscription not found"));
        
        // Save updates
        return inscriptionRepositoryData.save(entity);
    }












    @Transactional
public InscriptionEntity updateInscriptionForPlayerRegistration(PlayerEntity playerEntity) {
    // Get the team of the player
    TeamEntity team = playerEntity.getTeam();
    if (team == null) {
        throw new IllegalArgumentException("Player must belong to a team");
    }

    // Find existing inscription for this team
    List<InscriptionEntity> existingInscriptions = inscriptionRepositoryData
            .findByNameTeamContainingIgnoreCase(team.getTeamName());
    
    InscriptionEntity inscription;
    BigDecimal pricePerPlayer = new BigDecimal("120.00");
    
    if (existingInscriptions.isEmpty()) {
        // Create new inscription
        inscription = InscriptionEntity.builder()
                .nameTeam(team.getTeamName())
                .numPlayer(1) // Starting with 1 player
                .date(LocalDate.now())
                .amount(pricePerPlayer) // 120 for first player
                .build();
    } else {
        // Update existing inscription
        inscription = existingInscriptions.get(0); // Get first matching inscription
        inscription.setNumPlayer(inscription.getNumPlayer() + 1);
        inscription.setAmount(inscription.getAmount().add(pricePerPlayer));
        inscription.setDate(LocalDate.now());
    }
    
    return inscriptionRepositoryData.save(inscription);
}
}