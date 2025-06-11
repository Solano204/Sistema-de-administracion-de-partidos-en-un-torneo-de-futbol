package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;

// Application Service Interface
public interface InscriptionApplicationService {
    InscriptionInfoRecord existInscription(UUID inscriptionId);
    List<InscriptionInfoRecord> getAllInscriptions();
    InscriptionInfoRecord saveInscription(InscriptionInfoRecord inscription);
    List<InscriptionInfoRecord> getRecentInscriptions();
    void deleteInscription(UUID inscriptionId);
    List<InscriptionInfoRecord> findByTeamName(String teamName);
    InscriptionInfoRecord updateInscription(UUID id, InscriptionInfoRecord inscription);
}
