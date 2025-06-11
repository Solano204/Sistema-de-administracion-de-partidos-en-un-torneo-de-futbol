package com.soccer.fut7.soccer_system.ports.input.service;

import com.soccer.fut7.soccer_system.dto.DtoSecurity.TokenResponse;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateBasicInformation;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

import java.util.UUID;
import java.util.Set;

public interface RefereeApplicationService {

    Set<UserDetailsRecordFull> getAllReferees();

     TokenResponse  insertReferee(UserRegisterRecord refereeRecord);

    Boolean changeStatusReferee(UserStatus status, UUID refereeId);

    void updateUserDetails(UUID refereeId, UserUpdateBasicInformation updatedDetails);

    void deleteReferee(UUID refereeId);

    void updateRefereeProfilePhoto(UserUpdateProfilePhoto photoUpdate);
}