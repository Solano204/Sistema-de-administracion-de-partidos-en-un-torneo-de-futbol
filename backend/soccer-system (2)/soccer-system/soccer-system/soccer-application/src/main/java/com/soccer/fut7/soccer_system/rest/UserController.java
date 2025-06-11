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

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Lazy

public class UserController {
    
    @Autowired
    private UserApplicationService userApplicationService;
    
    @PutMapping("/photo")
    public TokenResponse updateUserProfilePhoto(@RequestBody UserUpdateProfilePhoto photoUpdate) {
       return userApplicationService.updateUserProfilePhoto(photoUpdate);
    }
    
   
    
    @GetMapping
    public Set<UserDetailsRecordFull> getAllUser(@RequestParam UserRole role) {
        return userApplicationService.getAllUser(role);
    }
    
    @PostMapping
    public  TokenResponse  insertUser(@RequestBody UserRegisterRecord userRecord) {
        return userApplicationService.insertUser(userRecord);
    }
    
    @PutMapping("/{userId}/status")
    public Boolean updateStatusUser(
            @RequestParam UserStatus status, 
            @PathVariable UUID userId) {
        return userApplicationService.updateStatusUser(status, userId);
    }
    
    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable UUID userId) {
        userApplicationService.deleteUser(userId);
    }

    @GetMapping("/exist-admin")
    public Boolean existAdmin(@RequestParam String role) {
         UserRole userRole = UserRole.valueOf(role);
        return userApplicationService.existAdmin(userRole);
    }

    @PutMapping("/{userId}")
    public void updateUserDetails(
            @PathVariable UUID userId, 
            @RequestBody UserUpdateBasicInformation updatedDetails) {
        userApplicationService.updateUserDetails(userId, updatedDetails);
    }


    @GetMapping("/get-user-details/{userId}")
    public UserDetailsRecordFull getUserDetails(@PathVariable UUID userId) {
        return userApplicationService.getUserDetails(userId);
    }
    
}