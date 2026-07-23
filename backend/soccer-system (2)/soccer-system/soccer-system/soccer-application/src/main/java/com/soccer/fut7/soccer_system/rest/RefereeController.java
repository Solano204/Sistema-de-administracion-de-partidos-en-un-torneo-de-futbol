package com.soccer.fut7.soccer_system.rest;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ports.input.service.RefereeApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Referees", description = "Referee accounts and match assignments. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/referees")
@AllArgsConstructor
@Lazy

public class RefereeController {

    @Autowired
    private RefereeApplicationService refereeApplicationService;

    @Operation(summary = "List all referees")
    @ApiResponse(responseCode = "200", description = "Referees returned")
    @GetMapping
    public Set<UserDetailsRecordFull> getAllReferees() {
        return refereeApplicationService.getAllReferees();
    }

    @Operation(summary = "Register a new referee")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Referee created, tokens returned"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public  TokenResponse  insertReferee(@RequestBody UserRegisterRecord refereeRecord) {
        return refereeApplicationService.insertReferee(refereeRecord);
    }

    @Operation(summary = "Activate/suspend a referee")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "404", description = "No referee exists with that id")
    })
    @PutMapping("/{refereeId}/status")
    public Boolean changeStatusReferee(
            @RequestParam UserStatus status,
            @PathVariable UUID refereeId) {
        return refereeApplicationService.changeStatusReferee(status, refereeId);
    }

    @Operation(summary = "Update a referee's basic information", operationId = "updateRefereeDetails")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Details updated"),
        @ApiResponse(responseCode = "404", description = "No referee exists with that id")
    })
    @PutMapping("/{refereeId}")
    public void updateUserDetails(
            @PathVariable UUID refereeId,
            @RequestBody UserUpdateBasicInformation updatedDetails) {
        refereeApplicationService.updateUserDetails(refereeId, updatedDetails);
    }

    @Operation(summary = "Delete a referee")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Referee deleted"),
        @ApiResponse(responseCode = "404", description = "No referee exists with that id")
    })
    @DeleteMapping("/{refereeId}")
    public void deleteReferee(@PathVariable UUID refereeId) {
        refereeApplicationService.deleteReferee(refereeId);
    }

    @Operation(summary = "Update a referee's profile photo")
    @ApiResponse(responseCode = "200", description = "Photo updated")
    @PutMapping("/photo")
    public void updateRefereeProfilePhoto(@RequestBody UserUpdateProfilePhoto photoUpdate) {
        refereeApplicationService.updateRefereeProfilePhoto(photoUpdate);
    }
}
