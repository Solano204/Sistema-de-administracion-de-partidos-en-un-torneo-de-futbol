package com.soccer.fut7.soccer_system.EntityApplication;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Stats extends BaseEntity {
    private int wins;
    private int losses;
    private int draws;
    private int pointsFor;
    private int pointsAgainst;
    
    protected void validateStats() {
        if (wins < 0 || losses < 0 || draws < 0) {
            throw new IllegalArgumentException("Wins, losses and draws cannot be negative");
        }
        if (pointsFor < 0 || pointsAgainst < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }
    }
}