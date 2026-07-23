package com.soccer.fut7.soccer_system.rest;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFullWithPassword;
import com.soccer.fut7.soccer_system.dto.user.UserLoginRecord;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;

import lombok.AllArgsConstructor;

@Tag(name = "Users", description = "User accounts (all roles: ADMINISTRADOR, ARBITRO, CAPITAN, JUGADOR, USER). Self-registration is public; everything else requires a session, most operations require ADMINISTRADOR.")
@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Lazy

public class UserController {
    
    @Autowired
    private UserApplicationService userApplicationService;
    
    // Doc 1 CRITICAL FIX: none of these had any @PreAuthorize, and until this
    // pass "/users/**" was entirely permitAll() at the URL level in
    // SecurityConfig - every method below (including delete/status/details
    // update for ANY user) was reachable with no authentication whatsoever.
    // Added here as defense in depth on top of the SecurityConfig fix, so a
    // future accidental URL-pattern change can't silently reopen this.
    @Operation(summary = "Update a user's profile photo", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Photo updated, fresh tokens returned"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/photo")
    public TokenResponse updateUserProfilePhoto(@RequestBody UserUpdateProfilePhoto photoUpdate) {
       return userApplicationService.updateUserProfilePhoto(photoUpdate);
    }


    // hasRole()+hasAuthority() dual check: CommandHelperTokenProvider issues
    // role claims inconsistently depending on which flow mints the token -
    // generateDirectTokenResponse prepends "ROLE_", but the normal
    // /auth/login path (loadUserByUsername -> getAuthoritiesString) does not.
    // hasRole('ADMINISTRADOR') alone would silently 403 a real admin who
    // logged in normally. See REVIEW_NOTES.md - the real fix is making
    // authority-building consistent in CommandHelperTokenProvider/
    // CommandHelperUser, not this workaround, but that's a broader change
    // than is safe to make blindly in the same pass as an urgent auth fix.
    @Operation(summary = "List all users with a given role", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users returned"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token"),
        @ApiResponse(responseCode = "403", description = "Caller is authenticated but not an ADMINISTRADOR")
    })
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')")
    @GetMapping
    public Set<UserDetailsRecordFull> getAllUser(@RequestParam UserRole role) {
        return userApplicationService.getAllUser(role);
    }

    // Intentionally public: this is the self-registration endpoint. Role
    // escalation to ADMINISTRADOR is self-limited by CommandHelperUser.
    // insertUser's "Admin already exist" bootstrap check, not by this
    // controller - see REVIEW_NOTES.md for the flagged gap around other
    // privileged roles (ARBITRO/CAPITAN) not having an equivalent guard.
    @Operation(summary = "Register a new user (public)", description = "role is client-supplied; self-registering as ADMINISTRADOR is only allowed once (bootstrap). ARBITRO/CAPITAN currently have no equivalent guard - see REVIEW_NOTES.md.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User created, tokens returned"),
        @ApiResponse(responseCode = "400", description = "Validation failed, or role=ADMINISTRADOR was requested after an admin already exists")
    })
    @PostMapping
    public  TokenResponse  insertUser(@RequestBody UserRegisterRecord userRecord) {
        return userApplicationService.insertUser(userRecord);
    }

    // hasRole()+hasAuthority() dual check: CommandHelperTokenProvider issues
    // role claims inconsistently depending on which flow mints the token -
    // generateDirectTokenResponse prepends "ROLE_", but the normal
    // /auth/login path (loadUserByUsername -> getAuthoritiesString) does not.
    // hasRole('ADMINISTRADOR') alone would silently 403 a real admin who
    // logged in normally. See REVIEW_NOTES.md - the real fix is making
    // authority-building consistent in CommandHelperTokenProvider/
    // CommandHelperUser, not this workaround, but that's a broader change
    // than is safe to make blindly in the same pass as an urgent auth fix.
    @Operation(summary = "Activate/suspend a user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token"),
        @ApiResponse(responseCode = "403", description = "Caller is authenticated but not an ADMINISTRADOR")
    })
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')")
    @PutMapping("/{userId}/status")
    public Boolean updateStatusUser(
            @RequestParam UserStatus status,
            @PathVariable UUID userId) {
        return userApplicationService.updateStatusUser(status, userId);
    }

    // hasRole()+hasAuthority() dual check: CommandHelperTokenProvider issues
    // role claims inconsistently depending on which flow mints the token -
    // generateDirectTokenResponse prepends "ROLE_", but the normal
    // /auth/login path (loadUserByUsername -> getAuthoritiesString) does not.
    // hasRole('ADMINISTRADOR') alone would silently 403 a real admin who
    // logged in normally. See REVIEW_NOTES.md - the real fix is making
    // authority-building consistent in CommandHelperTokenProvider/
    // CommandHelperUser, not this workaround, but that's a broader change
    // than is safe to make blindly in the same pass as an urgent auth fix.
    @Operation(summary = "Delete a user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User deleted"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token"),
        @ApiResponse(responseCode = "403", description = "Caller is authenticated but not an ADMINISTRADOR")
    })
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasAuthority('ADMINISTRADOR')")
    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable UUID userId) {
        userApplicationService.deleteUser(userId);
    }

    // Intentionally public: the frontend needs to know whether an admin
    // account exists yet to decide whether to show the initial admin-setup
    // flow, before anyone has a token. Only returns a boolean, no user data.
    @Operation(summary = "Check whether an admin account already exists (public)", description = "Used by the frontend to decide whether to show the initial admin-setup flow before anyone has a token.")
    @ApiResponse(responseCode = "200", description = "true if a user with that role exists")
    @GetMapping("/exist-admin")
    public Boolean existAdmin(@RequestParam String role) {
         UserRole userRole = UserRole.valueOf(role);
        return userApplicationService.existAdmin(userRole);
    }

    @Operation(summary = "Update a user's basic information", operationId = "updateUserDetails", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Details updated"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{userId}")
    public void updateUserDetails(
            @PathVariable UUID userId,
            @RequestBody UserUpdateBasicInformation updatedDetails) {
        userApplicationService.updateUserDetails(userId, updatedDetails);
    }


    @Operation(summary = "Get a user's full details by id", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User found (password never included)"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get-user-details/{userId}")
    public UserDetailsRecordFull getUserDetails(@PathVariable UUID userId) {
        return userApplicationService.getUserDetails(userId);
    }

}