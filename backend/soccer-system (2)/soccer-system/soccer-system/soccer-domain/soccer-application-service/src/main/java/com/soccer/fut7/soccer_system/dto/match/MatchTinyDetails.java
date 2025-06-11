package com.soccer.fut7.soccer_system.dto.match;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;

public record MatchTinyDetails(UUID idMatch,String phase,UUID tourmentId, String tournamentName , MatchStatus status,String category, TeamNameIdRecord team1, TeamNameIdRecord team2) {}


// public record MatchTinyDetails(UUID idMatch,String phase,UUID tourmentId, MatchStatus status, TeamNameIdRecord teamId, TeamNameIdRecord teamId2, CategoryInfoRecord category) {}
