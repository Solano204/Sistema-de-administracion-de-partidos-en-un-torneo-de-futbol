package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.Set;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.RequestParam;

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

public interface UserApplicationService {

    // UserDetails loadUserByUsername(String username) throws
    // UsernameNotFoundException;
    TokenResponse updateUserProfilePhoto(UserUpdateProfilePhoto photoUpdate);

    void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails);

    Set<UserDetailsRecordFull> getAllUser(UserRole role);

    TokenResponse  insertUser(UserRegisterRecord refereeRecord);

    Boolean updateStatusUser(UserStatus status, UUID userId);

    void deleteUser(UUID userId);


    UserDetailsRecordFull getUserDetails(UUID userId);


    public TokenResponse changePassword(String username,
            String currentPassword,
            String newPassword);

            public TokenResponse changePasswordWithoutPassword(String username,
                    String newPassword);

    public TokenResponse loginUser(LoginRequest refereeRecord);

    public TokenResponse changeUsername(String currentUsername, String newUsername,
            String currentPassword);

    public TokenResponse refreshToken(RefreshTokenRequest refreshRequest) throws AuthenticationException;

    public  Boolean DoFilter(HttpServletRequest request, HttpServletResponse response);

        public Boolean existAdmin(UserRole role);
    

}
