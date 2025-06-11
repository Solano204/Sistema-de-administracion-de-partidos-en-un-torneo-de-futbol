package com.soccer.fut7.soccer_system.rest;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.dto.Incription.InscriptionInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.InscriptionApplicationService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/inscriptions")
@AllArgsConstructor
public class InscriptionController {
    
    private final InscriptionApplicationService inscriptionApplicationService;
    
    @GetMapping("/{id}")
    public ResponseEntity<InscriptionInfoRecord> getInscription(@PathVariable UUID id) {
        InscriptionInfoRecord inscription = inscriptionApplicationService.existInscription(id);
        return inscription != null
               ? ResponseEntity.ok(inscription)
               : ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<InscriptionInfoRecord>> getAllInscriptions() {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.getAllInscriptions();
        return ResponseEntity.ok(inscriptions);
    }
    
    @PostMapping
    public ResponseEntity<InscriptionInfoRecord> saveInscription(@RequestBody InscriptionInfoRecord inscription) {
        InscriptionInfoRecord savedInscription = inscriptionApplicationService.saveInscription(inscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedInscription);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<InscriptionInfoRecord>> getRecentInscriptions() {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.getRecentInscriptions();
        return ResponseEntity.ok(inscriptions);
    }
    

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInscription(@PathVariable UUID id) {
        inscriptionApplicationService.deleteInscription(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/by-team")
    public ResponseEntity<List<InscriptionInfoRecord>> getByTeamName(@RequestParam String teamName) {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.findByTeamName(teamName);
        return ResponseEntity.ok(inscriptions);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InscriptionInfoRecord> updateInscription(
            @PathVariable UUID id, 
            @RequestBody InscriptionInfoRecord inscription) {
        InscriptionInfoRecord updatedInscription = inscriptionApplicationService.updateInscription(id, inscription);
        return ResponseEntity.ok(updatedInscription);
    }
}