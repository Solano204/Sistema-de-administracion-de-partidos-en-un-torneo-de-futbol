package com.soccer.fut7.soccer_system.ports.outport;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Inscription;

// Domain Repository Interface
public interface InscriptionRepository {
    Optional<Inscription> existInscription(UUID inscriptionId);
    Optional<List<Inscription>> getAllInscriptions();
    Optional<Inscription> saveInscription(Inscription inscription);
    Optional<List<Inscription>> getRecentInscriptions();
    
    void deleteInscription(UUID inscriptionId);
    Optional<List<Inscription>> findByTeamName(String teamName);
    Optional<Inscription> updateInscription(Inscription inscription);
}