package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;


import java.util.Set;
import java.util.UUID;
import org.springframework.security.core.AuthenticationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.LoginRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.RefreshTokenRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFullWithPassword;
import com.soccer.fut7.soccer_system.dto.user.UserLoginRecord;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperUser;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@Component
@Lazy
@AllArgsConstructor
public class CommandHandlerUser {

    

    private final CommandHelperUser commandHelperUser;

    public TokenResponse updateUserProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
       return commandHelperUser.updateUserProfilePhoto(photoUpdate);
    }

    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {
        commandHelperUser.updateUserDetails(refereeId, updatedDetails);
    }

    public Set<UserDetailsRecordFull> getAllUser(UserRole role) {
        return commandHelperUser.getAllUser(role);
    }

    public  TokenResponse  insertUser(UserRegisterRecord refereeRecord) {
        return commandHelperUser.insertUser(refereeRecord);
    }

    public Boolean updateStatusUser(UserStatus status, UUID userId) {
        return commandHelperUser.updateStatusUser(status, userId);
    }

    public void deleteUser(UUID userId) {
        commandHelperUser.deleteUser(userId);
    }



 public TokenResponse loginUser(LoginRequest refereeRecord) {
    
        return commandHelperUser.loginUser(refereeRecord);
    }

    public TokenResponse changePassword(String username,
            String currentPassword,
            String newPassword) {
                
        return commandHelperUser.changePassword( username, currentPassword, newPassword);
    }

    public TokenResponse changeUsername( String currentUsername, String newUsername, String currentPassword) {
        return commandHelperUser.changeUsername( currentUsername, newUsername, currentPassword);
    }

    public User getUserByUsername(String username) {
        // return commandHelperUser.getUserByUsername(username);
        return  commandHelperUser.getUserByUsername(username);
    }



     public TokenResponse refreshToken(RefreshTokenRequest refreshRequest) throws AuthenticationException {
        return commandHelperUser.refreshToken(refreshRequest);  
    }

    public Boolean DoFilter(HttpServletRequest request, HttpServletResponse response) {
        return commandHelperUser.DoFilter(request, response);
    }

    public Boolean existAdmin(UserRole role) {
        return commandHelperUser.existAdmin(role);
    }

    public UserDetailsRecordFull getUserDetails(UUID userId) {
        return commandHelperUser.getUserDetailsRecordFull(userId);
    }

    public TokenResponse changePasswordWithoutPassword(String username, String newPassword) {
       return commandHelperUser.changePasswordWithoutPassword(username, newPassword);
    }
    
}
