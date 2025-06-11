package com.soccer.fut7.soccer_system.dto.match;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.referee.RefereeDetailsRecord;

public record MatchFullRecord(
    UUID id,
     UUID categoryId,
     LocalDate matchDate,
     MatchStatus status,
     RefereeDetailsRecord referee,
     MatchStatsDetails resultsTeam1,
     MatchStatsDetails resultsTeam2
     
     
     ){}
