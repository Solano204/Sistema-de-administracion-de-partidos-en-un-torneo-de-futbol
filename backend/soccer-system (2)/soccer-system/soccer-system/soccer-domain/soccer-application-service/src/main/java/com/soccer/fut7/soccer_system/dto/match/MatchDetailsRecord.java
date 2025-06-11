package com.soccer.fut7.soccer_system.dto.match;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.InfoTeamMatch;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.referee.UserRefereeSummaryRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamResultRecord;

public record MatchDetailsRecord(
    UUID idMatch,
     MatchStatsDetails homeTeam,
     MatchStatsDetails awayTeam
) {}