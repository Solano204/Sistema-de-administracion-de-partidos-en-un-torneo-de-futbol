package com.soccer.fut7.soccer_system.ports.outport;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.Person;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.user.UserDetailsRecord;
import com.soccer.fut7.soccer_system.dto.user.UserUpdateProfilePhoto;

@Repository
public interface RefereeRepository {
    // Get all referees with details (without password)

    // Insert a new referee

    // Update referee details

    // Delete a referee by ID
    void deleteReferee(UUID refereeId);
}