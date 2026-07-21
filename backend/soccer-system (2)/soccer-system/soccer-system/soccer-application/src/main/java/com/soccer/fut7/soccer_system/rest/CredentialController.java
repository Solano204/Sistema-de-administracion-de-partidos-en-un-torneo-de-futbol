package com.soccer.fut7.soccer_system.rest;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.soccer.fut7.soccer_system.EntityApplication.Credential;
import com.soccer.fut7.soccer_system.dto.creadential.CredentialInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CredencialApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Tag(name = "Credentials", description = "Match/tournament staff credentials. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/api/credentials")
@AllArgsConstructor
public class CredentialController {

    private final CredencialApplicationService credentialApplicationService;

    @Operation(summary = "Get a credential by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Credential found"),
        @ApiResponse(responseCode = "404", description = "No credential exists with that id")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CredentialInfoRecord> getCredential(@PathVariable UUID id) {
        CredentialInfoRecord credential = credentialApplicationService.existCredential(id);
        return credential != null
            ? ResponseEntity.ok(credential)
            : ResponseEntity.notFound().build();
    }

    @Operation(summary = "List all credentials")
    @ApiResponse(responseCode = "200", description = "Credentials returned")
    @GetMapping
    public ResponseEntity<List<CredentialInfoRecord>> getAllCredentials() {
        List<CredentialInfoRecord> credentials = credentialApplicationService.getAllCredentials();
        return ResponseEntity.ok(credentials);
    }

    @Operation(summary = "Create a credential")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Credential created"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public ResponseEntity<CredentialInfoRecord> createCredential(@RequestBody Credential credential) {
        CredentialInfoRecord savedCredential = credentialApplicationService.saveCredential(credential);
        return savedCredential != null
            ? ResponseEntity.ok(savedCredential)
            : ResponseEntity.badRequest().build();
    }

    @Operation(summary = "Update a credential")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Credential updated"),
        @ApiResponse(responseCode = "404", description = "No credential exists with that id")
    })
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

    @Operation(summary = "Delete a credential")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Credential deleted"),
        @ApiResponse(responseCode = "404", description = "No credential exists with that id")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<CredentialInfoRecord> deleteCredential(@PathVariable UUID id) {
        CredentialInfoRecord deletedCredential = credentialApplicationService.deleteCredential(id);
        return deletedCredential != null
            ? ResponseEntity.ok(deletedCredential)
            : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Search credentials by name", description = "containing=true does a substring match; otherwise an exact match.")
    @ApiResponse(responseCode = "200", description = "Credentials returned (possibly empty)")
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
