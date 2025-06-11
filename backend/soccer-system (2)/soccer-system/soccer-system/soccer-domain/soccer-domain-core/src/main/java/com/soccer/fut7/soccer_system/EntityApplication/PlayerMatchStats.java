package com.soccer.fut7.soccer_system.EntityApplication;

import java.rmi.server.UID;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlayerMatchStats extends BaseEntity {
    private UUID idTeam;
    private UUID idPlayer;
    private String namePlayer;
    private Goals goals;
    private Points points;
    private boolean attended;
    private JerseyNumber jerseyNumber;
    private Cards cards;
    
    protected void validatePlayerMatchStats() {
        if (goals == null) {
            this.goals = Goals.zero();
        }
        if (jerseyNumber == null) {
            throw new IllegalArgumentException("Jersey number cannot be null");
        }
        if (cards == null) {
            this.cards = Cards.none();
        }
        
    }
}