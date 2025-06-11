package com.soccer.fut7.soccer_system.EntityApplication;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchPhase;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;

import lombok.*;
@Getter
@Setter
@Builder
public class Match extends AggregateRoot {
    private UUID id;
    private UUID categoryId;
    private MatchDate matchDate;
    private String phase;
    private Team wonTeam;
    private Team lostTeam;
    private UUID tournament_id;
    private int numberJourney;
    private MatchStatus status;
    private User referee;
    private MatchResults results;

 
}
