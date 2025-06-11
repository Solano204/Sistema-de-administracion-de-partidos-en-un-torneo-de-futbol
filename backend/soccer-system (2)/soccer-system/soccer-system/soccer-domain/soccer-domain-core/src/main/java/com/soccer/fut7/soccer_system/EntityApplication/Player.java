package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import com.soccer.fut7.soccer_system.ValueObject.*;

@Getter
@Setter
@SuperBuilder
public class Player extends Person {
    private UUID id;
    private JerseyNumber jerseyNumber;
    private Team team;
    private Goals goals;
    private Points points;
    private String photo;
    private PlayerStatus playerStatus;
    private Set<PlayerMatchStats> matchStats;
    private Cards cards;
    private Boolean isCaptain;
    private Email email;

  
}