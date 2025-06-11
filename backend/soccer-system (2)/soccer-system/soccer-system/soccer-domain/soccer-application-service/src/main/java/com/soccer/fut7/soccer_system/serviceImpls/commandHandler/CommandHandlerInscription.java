package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperInscription;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class CommandHandlerInscription {
    
    private final CommandHelperInscription commandHelperInscription;
    
    public Optional<InscriptionInfoRecord> existInscription(UUID inscriptionId) {
        return commandHelperInscription.existInscription(inscriptionId);
    }
    
    public Optional<List<InscriptionInfoRecord>> getAllInscriptions() {
        return commandHelperInscription.getAllInscriptions();
    }
    
    public InscriptionInfoRecord saveInscription(InscriptionInfoRecord inscription) {
        return commandHelperInscription.saveInscription(inscription);
    }
    
    public Optional<List<InscriptionInfoRecord>> getRecentInscriptions() {
        return commandHelperInscription.getRecentInscriptions();
    }
    
 
    
    public void deleteInscription(UUID inscriptionId) {
        commandHelperInscription.deleteInscription(inscriptionId);
    }
    
    public Optional<List<InscriptionInfoRecord>> findByTeamName(String teamName) {
        return commandHelperInscription.findByTeamName(teamName);
    }
    
    public InscriptionInfoRecord updateInscription(UUID id, InscriptionInfoRecord inscription) {
        return commandHelperInscription.updateInscription(id, inscription);
    }
}