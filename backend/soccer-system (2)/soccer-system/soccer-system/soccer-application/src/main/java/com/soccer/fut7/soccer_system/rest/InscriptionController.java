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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Inscriptions", description = "Team inscriptions into a tournament/category. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/inscriptions")
@AllArgsConstructor
public class InscriptionController {

    private final InscriptionApplicationService inscriptionApplicationService;

    @Operation(summary = "Get an inscription by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inscription found"),
        @ApiResponse(responseCode = "404", description = "No inscription exists with that id")
    })
    @GetMapping("/{id}")
    public ResponseEntity<InscriptionInfoRecord> getInscription(@PathVariable UUID id) {
        InscriptionInfoRecord inscription = inscriptionApplicationService.existInscription(id);
        return inscription != null
               ? ResponseEntity.ok(inscription)
               : ResponseEntity.notFound().build();
    }

    @Operation(summary = "List all inscriptions")
    @ApiResponse(responseCode = "200", description = "Inscriptions returned")
    @GetMapping
    public ResponseEntity<List<InscriptionInfoRecord>> getAllInscriptions() {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.getAllInscriptions();
        return ResponseEntity.ok(inscriptions);
    }

    @Operation(summary = "Create an inscription")
    @ApiResponse(responseCode = "201", description = "Inscription created")
    @PostMapping
    public ResponseEntity<InscriptionInfoRecord> saveInscription(@RequestBody InscriptionInfoRecord inscription) {
        InscriptionInfoRecord savedInscription = inscriptionApplicationService.saveInscription(inscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedInscription);
    }

    @Operation(summary = "List the most recent inscriptions")
    @ApiResponse(responseCode = "200", description = "Inscriptions returned")
    @GetMapping("/recent")
    public ResponseEntity<List<InscriptionInfoRecord>> getRecentInscriptions() {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.getRecentInscriptions();
        return ResponseEntity.ok(inscriptions);
    }



    @Operation(summary = "Delete an inscription")
    @ApiResponse(responseCode = "204", description = "Inscription deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInscription(@PathVariable UUID id) {
        inscriptionApplicationService.deleteInscription(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get inscriptions by team name")
    @ApiResponse(responseCode = "200", description = "Inscriptions returned (possibly empty)")
    @GetMapping("/by-team")
    public ResponseEntity<List<InscriptionInfoRecord>> getByTeamName(@RequestParam String teamName) {
        List<InscriptionInfoRecord> inscriptions = inscriptionApplicationService.findByTeamName(teamName);
        return ResponseEntity.ok(inscriptions);
    }

    @Operation(summary = "Update an inscription")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inscription updated"),
        @ApiResponse(responseCode = "404", description = "No inscription exists with that id")
    })
    @PutMapping("/{id}")
    public ResponseEntity<InscriptionInfoRecord> updateInscription(
            @PathVariable UUID id,
            @RequestBody InscriptionInfoRecord inscription) {
        InscriptionInfoRecord updatedInscription = inscriptionApplicationService.updateInscription(id, inscription);
        return ResponseEntity.ok(updatedInscription);
    }
}
