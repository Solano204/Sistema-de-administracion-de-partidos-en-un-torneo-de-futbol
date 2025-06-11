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

import lombok.AllArgsConstructor;
@RestController
@RequestMapping("/referees")
@AllArgsConstructor
@Lazy

public class RefereeController {
    
    @Autowired
    private RefereeApplicationService refereeApplicationService;
    
    @GetMapping
    public Set<UserDetailsRecordFull> getAllReferees() {
        return refereeApplicationService.getAllReferees();
    }
    
    @PostMapping
    public  TokenResponse  insertReferee(@RequestBody UserRegisterRecord refereeRecord) {
        return refereeApplicationService.insertReferee(refereeRecord);
    }
    
    @PutMapping("/{refereeId}/status")
    public Boolean changeStatusReferee(
            @RequestParam UserStatus status, 
            @PathVariable UUID refereeId) {
        return refereeApplicationService.changeStatusReferee(status, refereeId);
    }
    
    @PutMapping("/{refereeId}")
    public void updateUserDetails(
            @PathVariable UUID refereeId, 
            @RequestBody UserUpdateBasicInformation updatedDetails) {
        refereeApplicationService.updateUserDetails(refereeId, updatedDetails);
    }
    
    @DeleteMapping("/{refereeId}")
    public void deleteReferee(@PathVariable UUID refereeId) {
        refereeApplicationService.deleteReferee(refereeId);
    }
    
    @PutMapping("/photo")
    public void updateRefereeProfilePhoto(@RequestBody UserUpdateProfilePhoto photoUpdate) {
        refereeApplicationService.updateRefereeProfilePhoto(photoUpdate);
    }
}