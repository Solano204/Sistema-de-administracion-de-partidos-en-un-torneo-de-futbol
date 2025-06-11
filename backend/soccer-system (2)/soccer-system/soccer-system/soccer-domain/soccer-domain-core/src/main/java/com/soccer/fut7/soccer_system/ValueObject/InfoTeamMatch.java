package com.soccer.fut7.soccer_system.ValueObject;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;

public record InfoTeamMatch (String name,UUID id,  Goals goalsWin, Goals goalsAgainst, Points points, Set<PlayerMatchStats> infoPlayerMatchStats
){
}
