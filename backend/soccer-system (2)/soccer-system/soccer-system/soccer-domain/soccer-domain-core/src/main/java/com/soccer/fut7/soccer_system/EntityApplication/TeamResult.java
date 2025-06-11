package com.soccer.fut7.soccer_system.EntityApplication;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamResult extends BaseEntity {
    private UUID id;
    private Team homeTeam;
    private Team awayTeam;
    private Match match;
    private Goals homeTeamGoals;
    private Goals awayTeamGoals;
    
    protected void validateTeamResult() {
        
        if (homeTeam == null) {
            throw new IllegalArgumentException("Home team cannot be null");
        }
        if (awayTeam == null) {
            throw new IllegalArgumentException("Away team cannot be null");
        }
        if (match == null) {
            throw new IllegalArgumentException("Match cannot be null");
        }
        if (homeTeamGoals == null) {
            this.homeTeamGoals = Goals.zero();
        }
        if (awayTeamGoals == null) {
            this.awayTeamGoals = Goals.zero();
        }
    }
    
 
}