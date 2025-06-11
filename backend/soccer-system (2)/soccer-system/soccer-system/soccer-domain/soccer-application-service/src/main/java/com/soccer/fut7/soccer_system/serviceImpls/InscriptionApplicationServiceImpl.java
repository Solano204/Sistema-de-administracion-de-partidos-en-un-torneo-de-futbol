package com.soccer.fut7.soccer_system.serviceImpls;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.InscriptionApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerInscription;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class InscriptionApplicationServiceImpl implements InscriptionApplicationService {
    
    private final CommandHandlerInscription commandHandlerInscription;
    
    @Override
    public InscriptionInfoRecord existInscription(UUID inscriptionId) {
        return commandHandlerInscription.existInscription(inscriptionId)
                .orElseThrow(() -> new RuntimeException("Inscription not found"));
    }
    
    @Override
    public List<InscriptionInfoRecord> getAllInscriptions() {
        return commandHandlerInscription.getAllInscriptions()
                .orElse(Collections.emptyList());
    }
    
    @Override
    public InscriptionInfoRecord saveInscription(InscriptionInfoRecord inscription) {
        return commandHandlerInscription.saveInscription(inscription);
    }
    
    @Override
    public List<InscriptionInfoRecord> getRecentInscriptions() {
        return commandHandlerInscription.getRecentInscriptions()
                .orElse(Collections.emptyList());
    }
    
    
    @Override
    public void deleteInscription(UUID inscriptionId) {
        commandHandlerInscription.deleteInscription(inscriptionId);
    }
    
    @Override
    public List<InscriptionInfoRecord> findByTeamName(String teamName) {
        return commandHandlerInscription.findByTeamName(teamName)
                .orElse(Collections.emptyList());
    }
    
    @Override
    public InscriptionInfoRecord updateInscription(UUID id, InscriptionInfoRecord inscription) {
        return commandHandlerInscription.updateInscription(id, inscription);
    }
}