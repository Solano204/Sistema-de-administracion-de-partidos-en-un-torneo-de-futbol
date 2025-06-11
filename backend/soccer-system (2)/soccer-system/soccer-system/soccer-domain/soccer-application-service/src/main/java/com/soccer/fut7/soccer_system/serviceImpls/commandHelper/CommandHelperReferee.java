package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.io.ObjectInputFilter.Status;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.UserDataHandler;

import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ExceptionApplication.RefereeException;
import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserDetailsRecord;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.mappers.RefereeMapperDomain;
import com.soccer.fut7.soccer_system.mappers.UserMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.RefereeRepository;
import com.soccer.fut7.soccer_system.ports.outport.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Lazy

@RequiredArgsConstructor
public class CommandHelperReferee {
    private final RefereeRepository refereeRepository;
    private final CommandHelperUser commandHelperUser;

    @Transactional
    public Set<UserDetailsRecordFull> getAllReferees() {
        return commandHelperUser.getAllUser(UserRole.ARBITRO);
    }

    @Transactional
    public  TokenResponse  insertReferee(UserRegisterRecord refereeRecord) {
        return commandHelperUser.insertUser(refereeRecord);
        
    }
    @Transactional
    public Boolean changeStatusReferee(UserStatus status, UUID refereeId) {
        return commandHelperUser.updateStatusUser(status, refereeId);        
    }
    

    @Transactional
    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {
        commandHelperUser.updateUserDetails(refereeId, updatedDetails);
    }

    @Transactional
    public void deleteReferee(UUID refereeId) {
        refereeRepository.deleteReferee(refereeId);
    }

    @Transactional
    public void updateRefereeProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
        commandHelperUser.updateUserProfilePhoto(photoUpdate);
    }
}