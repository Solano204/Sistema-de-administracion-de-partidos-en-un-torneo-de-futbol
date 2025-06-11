package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.Set;
import java.util.UUID;

import lombok.Getter;

@Getter
public class Journey {
    private UUID idJourney;
    private int numberJourney;
    private Set<Match> results;
}
