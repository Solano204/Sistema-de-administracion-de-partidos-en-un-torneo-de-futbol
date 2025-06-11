package com.soccer.fut7.soccer_system.team.adapter;

import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ports.outport.RefereeRepository;
import com.soccer.fut7.soccer_system.team.helpers.UserCommandHelperRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Component
@Lazy

public class RefereeAdapter implements RefereeRepository {

    private final UserCommandHelperRepository userCommandHelperRepository;
    
    @Override
    public void deleteReferee(UUID refereeId) {
        userCommandHelperRepository.deleteUserByIdAndUserRole(refereeId, UserRole.ARBITRO);
    }   
    
}
  