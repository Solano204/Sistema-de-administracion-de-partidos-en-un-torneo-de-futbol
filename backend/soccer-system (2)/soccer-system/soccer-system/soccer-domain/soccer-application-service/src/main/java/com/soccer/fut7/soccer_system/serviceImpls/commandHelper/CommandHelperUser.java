package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ExceptionApplication.TokenException;
import com.soccer.fut7.soccer_system.ExceptionApplication.UserException;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.LoginRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.RefreshTokenRequest;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.mappers.UserMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.UserRepository;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.Security.CommandHelperTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CommandHelperUser implements UserDetailsService {

    private final CommandHelperTokenProvider commandHelperTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapperDomain userMapper;
    private final PlatformTransactionManager transactionManager;

    public CommandHelperUser(CommandHelperTokenProvider commandHelperTokenProvider, UserRepository userRepository,
            PasswordEncoder passwordEncoder, UserMapperDomain userMapper,
            PlatformTransactionManager transactionManager) {
        this.commandHelperTokenProvider = commandHelperTokenProvider;
        this.userRepository = userRepository;
        this.transactionManager = transactionManager;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    // Setter injection for AuthenticationManager
    private AuthenticationManager authenticationManager;

    @Autowired
    @Lazy
    public void setAuthenticationManager(AuthenticationManager authManager) {
        this.authenticationManager = authManager;
    }

    @Transactional
    public TokenResponse updateUserProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
        UserDetailsRecordFull user = userMapper.UserToUserDetailsRecordFull(
                userRepository.getUserDetails(photoUpdate.id()).orElseThrow(() -> new UserException("User not found")));
        userRepository.updatePhotoProfile(photoUpdate.id(), photoUpdate.profilePhoto());

        return commandHelperTokenProvider.generateDirectTokenResponse(
                user.id(),
                user.user(),
                photoUpdate.profilePhoto(),
                user.role());

    }

    @Transactional
    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {

        if (existAdmin(UserRole.ADMINISTRADOR) && updatedDetails.role().equals(UserRole.ADMINISTRADOR)) {
            throw new UserException("Admin already exist");
        }
        userRepository.updateBasicInformation(refereeId, userMapper.userUpdateBasicInformationToUser(updatedDetails));

    }

    @Transactional
    public Set<UserDetailsRecordFull> getAllUser(UserRole role) {
        return userMapper.UserToUserDetailsRecordFull(userRepository.getAllUser(role)
                .orElseThrow(() -> new UserException(" Falla en la consulta")));
    }

    @Transactional
    public Boolean updateStatusUser(UserStatus status, UUID userId) {
        return userRepository.updateStatus(userId, status)
                .orElseThrow(() -> new UserException("Failed to update user status"));
    }

    public void deleteUser(UUID userId) {
        userRepository.deleteUser(userId);
    }

    // User login
    // User login
    public TokenResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = getUserByUsername(loginRequest.getUsername());
        return commandHelperTokenProvider.generateTokenResponse(authentication, user.getId(), user.getUrlphoto());
    }

    public TokenResponse refreshToken(RefreshTokenRequest refreshRequest) throws AuthenticationException {
        // First validate the refresh token
        if (!commandHelperTokenProvider.validateToken(refreshRequest.getRefreshToken())) {
            throw new TokenException("Invalid refresh token");
        }

        // Get the user ID from the refresh token
        UUID userId = commandHelperTokenProvider.getUserIdFromToken(refreshRequest.getRefreshToken());

        // Verify the user ID matches the request
        if (!userId.equals(refreshRequest.getUserId())) {
            throw new TokenException("User ID mismatch");
        }

        // Generate new tokens
        Authentication authentication = commandHelperTokenProvider.getAuthentication(refreshRequest.getRefreshToken());

        User user = userRepository.getUserDetails(userId).orElseThrow(() -> new UserException("User not found"));
        return commandHelperTokenProvider.generateTokenResponse(authentication, userId, user.getUrlphoto());
    }

    // Change user password

    public User getUserByUsername(String userName) {
        return userRepository.getUserByUsername(userName)
                .orElseThrow(() -> new UserException("El usuario no existe"));

    }

    public boolean handleJwtAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws java.io.IOException {
        String jwt = commandHelperTokenProvider.resolveToken(request);

        if (StringUtils.hasText(jwt)) {
            Authentication auth = commandHelperTokenProvider.getAuthentication(jwt);
            SecurityContextHolder.getContext().setAuthentication(auth);
            return true;
        }
        return false;
    }

    public boolean DoFilter(HttpServletRequest request,
            HttpServletResponse response) {
        try {
            return handleJwtAuthentication(request, response);
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Convert your UserRole enum to Spring Security GrantedAuthority
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole().name()));

        boolean isActive = user.getStatus() == UserStatus.ACTIVO;
        return new org.springframework.security.core.userdetails.User(
                user.getCredentials().username(),
                user.getCredentials().passwordHash(),
                isActive, // enabled
                true, // account non-expired
                true, // credentials non-expired
                true, // account non-locked
                authorities);
    }

    public TokenResponse insertUser(UserRegisterRecord refereeRecord) {

        if (existAdmin(UserRole.ADMINISTRADOR) && refereeRecord.role().equals(UserRole.ADMINISTRADOR)) {
            throw new UserException("Admin already exist");
        }
        // First transaction - insert user
        TransactionTemplate insertTransaction = new TransactionTemplate(transactionManager);
        User user = insertTransaction.execute(status -> {
            return userRepository.insertUser(userMapper.buildUserWithEncodedPassword(refereeRecord))
                    .orElseThrow(() -> new UserException("Failed to create referee"));
        });

        // Generate token directly with user role
        return commandHelperTokenProvider.generateDirectTokenResponse(
                user.getId(),
                user.getCredentials().username(),
                user.getUrlphoto(),
                user.getRole());
    }

    // Change user password
    public TokenResponse changePassword(String username, String currentPassword, String newPassword) {
        // 1. Find user
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UserException("User not found"));

        // 2. Verify current password (SECURE COMPARISON)
        if (!passwordEncoder.matches(currentPassword, user.getCredentials().passwordHash())) {
            throw new UserException("Current password is incorrect");
        }
        // 3. Validate new password
        if (currentPassword.equals(newPassword)) {
            throw new UserException("New password must be different");
        }
        validatePasswordComplexity(newPassword);

        // 4. Execute password change in a transaction
        TransactionTemplate changePasswordTransaction = new TransactionTemplate(transactionManager);
        Boolean success = changePasswordTransaction.execute(status -> {
            return userRepository
                    .changeUserPassword(user.getId(), username, currentPassword, passwordEncoder.encode(newPassword))
                    .orElseThrow(() -> new UserException("Failed to update password"));
        });

        if (!success) {
            throw new UserException("Password change was not successful");
        }

        // 5. Get updated user for token generation
        User updatedUser = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UserException("Failed to retrieve updated user information"));

        // 6. Generate token directly
        return commandHelperTokenProvider.generateDirectTokenResponse(updatedUser.getId(), username,
                updatedUser.getUrlphoto(), updatedUser.getRole());
    }

    public TokenResponse changePasswordWithoutPassword(String username, String newPassword) {
        // 1. Find user
        User user = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UserException("User not found"));

        // 2. Verify current password (SECURE COMPARISON)

        validatePasswordComplexity(newPassword);

        // 4. Execute password change in a transaction
        TransactionTemplate changePasswordTransaction = new TransactionTemplate(transactionManager);
        Boolean success = changePasswordTransaction.execute(status -> {
            return userRepository
                    .changePasswordWithoutPassword(user.getId(), username, passwordEncoder.encode(newPassword))
                    .orElseThrow(() -> new UserException("Failed to update password"));
        });

        if (!success) {
            throw new UserException("Password change was not successful");
        }

        // 5. Get updated user for token generation
        User updatedUser = userRepository.getUserByUsername(username)
                .orElseThrow(() -> new UserException("Failed to retrieve updated user information"));

        // 6. Generate token directly
        return commandHelperTokenProvider.generateDirectTokenResponse(updatedUser.getId(), updatedUser.getUrlphoto(),
                username, updatedUser.getRole());
    }

    private void validatePasswordComplexity(String password) {
        // Implement your complexity rules
        if (password.length() < 8) {
            throw new UserException("Password must be at least 8 characters");
        }
        // Add more rules as needed
    }

    public TokenResponse changeUsername(String currentUsername, String newUsername, String currentPassword) {
        // Find user
        User user = userRepository.getUserByUsername(currentUsername)
                .orElseThrow(() -> new UserException("User not found"));

        // Verify password (SECURE COMPARISON)
        if (!passwordEncoder.matches(currentPassword, user.getCredentials().passwordHash())) {
            throw new UserException("Password is incorrect");
        }

        // Check if new username exists
        if (userRepository.getUserByUsername(newUsername).isPresent()) {
            throw new UserException("Username already taken");
        }

        // Execute username change in a transaction
        TransactionTemplate changeUsernameTransaction = new TransactionTemplate(transactionManager);
        Boolean success = changeUsernameTransaction.execute(status -> {
            return userRepository.changeUsername(user.getId(), currentUsername, newUsername, currentPassword)
                    .orElseThrow(() -> new UserException("Failed to update username"));
        });

        if (!success) {
            throw new UserException("Username change was not successful");
        }

        // Get updated user for token generation
        User updatedUser = userRepository.getUserByUsername(newUsername)
                .orElseThrow(() -> new UserException("Failed to retrieve updated user information"));

        // Generate token directly with user role and new username
        return commandHelperTokenProvider.generateDirectTokenResponse(updatedUser.getId(), newUsername,
                updatedUser.getUrlphoto(), updatedUser.getRole());
    }

    public Boolean existAdmin(UserRole role) {
        return userRepository.existAdmin(role);
    }

    public UserDetailsRecordFull getUserDetailsRecordFull(UUID userId) {

        return userMapper.UserToUserDetailsRecordFull(
                userRepository.getUserDetails(userId).orElseThrow(() -> new UserException("User not found")));

    }
}