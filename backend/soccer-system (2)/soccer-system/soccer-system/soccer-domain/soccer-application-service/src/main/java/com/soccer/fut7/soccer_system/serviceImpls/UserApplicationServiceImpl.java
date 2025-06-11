package com.soccer.fut7.soccer_system.serviceImpls;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.AuthenticationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.User;
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
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerUser;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@Lazy

@RequiredArgsConstructor
public class UserApplicationServiceImpl implements UserApplicationService {

    private final CommandHandlerUser commandHandlerUser;

    @Override
    public TokenResponse updateUserProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
        return commandHandlerUser.updateUserProfilePhoto(photoUpdate);
    }

    @Override
    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {
        commandHandlerUser.updateUserDetails(refereeId, updatedDetails);
    }

    @Override
    public Set<UserDetailsRecordFull> getAllUser(UserRole role) {
        return commandHandlerUser.getAllUser(role);
    }

    @Override
    @Transactional

    public TokenResponse insertUser(UserRegisterRecord refereeRecord) {
        return commandHandlerUser.insertUser(refereeRecord);
    }

    @Override
    public Boolean updateStatusUser(UserStatus status, UUID userId) {
        return commandHandlerUser.updateStatusUser(status, userId);
    }

    @Override
    public void deleteUser(UUID userId) {
        commandHandlerUser.deleteUser(userId);
    }

    @Override
    public TokenResponse changePassword(String username,
            String currentPassword,
            String newPassword) {
        return commandHandlerUser.changePassword(username, currentPassword, newPassword);
    }

    @Override

    public TokenResponse changeUsername(String currentUsername, String newUsername, String currentPassword) {
        return commandHandlerUser.changeUsername(currentUsername, newUsername, currentPassword);
    }

    @Override

    public TokenResponse loginUser(LoginRequest refereeRecord) {
        return commandHandlerUser.loginUser(refereeRecord);
    }

    @Override

    public TokenResponse refreshToken(RefreshTokenRequest refreshRequest) throws AuthenticationException {

        return commandHandlerUser.refreshToken(refreshRequest);
    }

    @Override
    public Boolean DoFilter(HttpServletRequest request, HttpServletResponse response) {
        // TODO Auto-generated method stub
        return commandHandlerUser.DoFilter(request, response);
    }

    @Override
    public Boolean existAdmin(UserRole role) {
        // TODO Auto-generated method stub
        return commandHandlerUser.existAdmin(role);
    }

    @Override
    public UserDetailsRecordFull getUserDetails(UUID userId) {
        // TODO Auto-generated method stub
        return commandHandlerUser.getUserDetails(userId);
    }

    @Override
    public TokenResponse changePasswordWithoutPassword(String username, String newPassword) {
        // TODO Auto-generated method stub
        return commandHandlerUser.changePasswordWithoutPassword(username, newPassword);
    }

}
