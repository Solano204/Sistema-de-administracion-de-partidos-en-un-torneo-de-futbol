package com.soccer.fut7.soccer_system.serviceImpls;


import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ports.input.service.RefereeApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperReferee;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Service
@Lazy

@RequiredArgsConstructor
public class RefereeApplicationServiceImpl implements RefereeApplicationService {

    private final CommandHelperReferee commandHelperReferee;

    @Override
    public Set<UserDetailsRecordFull> getAllReferees() {
        return commandHelperReferee.getAllReferees();
    }

    @Override
    public  TokenResponse  insertReferee(UserRegisterRecord refereeRecord) {
        return commandHelperReferee.insertReferee(refereeRecord);
    }

    @Override
    public Boolean changeStatusReferee(UserStatus status, UUID refereeId) {
        return commandHelperReferee.changeStatusReferee(status, refereeId);
    }

    @Override
    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {
        commandHelperReferee.updateUserDetails(refereeId, updatedDetails);
    }

    @Override
    public void deleteReferee(UUID refereeId) {
        commandHelperReferee.deleteReferee(refereeId);
    }

    @Override
    public void updateRefereeProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
        commandHelperReferee.updateRefereeProfilePhoto(photoUpdate);
    }
}