package com.soccer.fut7.soccer_system.rest;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CredencialApplicationService;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/credentials")
@AllArgsConstructor
public class CredentialController {

    private final CredencialApplicationService credentialApplicationService;

    @GetMapping("/{id}")
    public ResponseEntity<CredentialInfoRecord> getCredential(@PathVariable UUID id) {
        CredentialInfoRecord credential = credentialApplicationService.existCredential(id);
        return credential != null 
            ? ResponseEntity.ok(credential) 
            : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<CredentialInfoRecord>> getAllCredentials() {
        List<CredentialInfoRecord> credentials = credentialApplicationService.getAllCredentials();
        return ResponseEntity.ok(credentials);
    }

    @PostMapping
    public ResponseEntity<CredentialInfoRecord> createCredential(@RequestBody Credential credential) {
        CredentialInfoRecord savedCredential = credentialApplicationService.saveCredential(credential);
        return savedCredential != null 
            ? ResponseEntity.ok(savedCredential) 
            : ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CredentialInfoRecord> updateCredential(
        @PathVariable UUID id, 
        @RequestBody Credential credential
    ) {
        // Ensure the ID in the path matches the credential's ID
        credential.setId(id);
        CredentialInfoRecord updatedCredential = credentialApplicationService.updateCredential(credential);
        return updatedCredential != null 
            ? ResponseEntity.ok(updatedCredential) 
            : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CredentialInfoRecord> deleteCredential(@PathVariable UUID id) {
        CredentialInfoRecord deletedCredential = credentialApplicationService.deleteCredential(id);
        return deletedCredential != null 
            ? ResponseEntity.ok(deletedCredential) 
            : ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CredentialInfoRecord>> searchCredentialsByName(
        @RequestParam(required = false) String name,
        @RequestParam(defaultValue = "false") boolean containing
    ) {
        List<CredentialInfoRecord> credentials = containing 
            ? credentialApplicationService.searchCredentialsByNameContaining(name)
            : credentialApplicationService.searchCredentialsByName(name);
        return ResponseEntity.ok(credentials);
    }
}