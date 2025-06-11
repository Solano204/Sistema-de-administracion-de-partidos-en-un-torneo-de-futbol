package com.soccer.fut7.soccer_system.dto.team;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;

public record TeamResultRecord(
    TeamTinyInfo homeTeamId,
    TeamTinyInfo awayTeamId
) {}