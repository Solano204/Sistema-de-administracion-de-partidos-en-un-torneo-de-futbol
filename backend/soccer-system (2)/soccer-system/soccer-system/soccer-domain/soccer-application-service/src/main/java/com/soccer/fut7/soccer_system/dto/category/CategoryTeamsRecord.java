package com.soccer.fut7.soccer_system.dto.category;

import java.util.List;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.team.TeamSummaryRecord;


public record CategoryTeamsRecord(
    UUID categoryId,
    String categoryName,
    List<TeamSummaryRecord> teams
) {}