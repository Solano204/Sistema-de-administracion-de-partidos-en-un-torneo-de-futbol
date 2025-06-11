package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperReferee;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
@Lazy

@RequiredArgsConstructor
public class CommandHandlerReferee {

    private final CommandHelperReferee commandHelperReferee;

    public Set<UserDetailsRecordFull> getAllReferees() {
        return commandHelperReferee.getAllReferees();
    }

    public  TokenResponse  insertReferee(UserRegisterRecord refereeRecord) {
        return commandHelperReferee.insertReferee(refereeRecord);
    }

    public Boolean changeStatusReferee(UserStatus status, UUID refereeId) {
        return commandHelperReferee.changeStatusReferee(status, refereeId);
    }

    public void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails) {
        commandHelperReferee.updateUserDetails(refereeId, updatedDetails);
    }

    public void deleteReferee(UUID refereeId) {
        commandHelperReferee.deleteReferee(refereeId);
    }

    public void updateRefereeProfilePhoto(UserUpdateProfilePhoto photoUpdate) {
        commandHelperReferee.updateRefereeProfilePhoto(photoUpdate);
    }
}
