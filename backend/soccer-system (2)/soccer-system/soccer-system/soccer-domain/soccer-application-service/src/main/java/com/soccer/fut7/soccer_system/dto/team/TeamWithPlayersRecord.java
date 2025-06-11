package com.soccer.fut7.soccer_system.dto.team;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;

public record TeamWithPlayersRecord(
    TeamDetailsRecord info,
    Set<PlayerDetailsRecord> players
) {}