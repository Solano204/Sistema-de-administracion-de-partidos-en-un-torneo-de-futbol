package com.soccer.fut7.soccer_system.dto.team;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;

public record TeamTinyInfo (String name,UUID id,  GoalsRecord goalsWin, GoalsRecord goalsAgainst, Set<PlayerMatchStatsRecordDto> statsPlayers){

}
