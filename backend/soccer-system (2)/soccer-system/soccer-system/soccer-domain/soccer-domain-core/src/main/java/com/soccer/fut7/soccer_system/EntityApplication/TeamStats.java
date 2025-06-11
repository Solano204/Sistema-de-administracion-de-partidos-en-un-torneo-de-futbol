package com.soccer.fut7.soccer_system.EntityApplication;
import java.beans.Transient;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Builder
public class TeamStats{
    private TeamStatsId id;
    private UUID idTeam;
    private String nameTeam;
    private int matchesPlayed;
    private int goalsWin;
    private int goalsAgainst;
    private int points;
    private int matchesWon;
    private int matchesDrawn;
    private int matchesLost;
    private boolean qualified;
    private String logo;
    
   
}