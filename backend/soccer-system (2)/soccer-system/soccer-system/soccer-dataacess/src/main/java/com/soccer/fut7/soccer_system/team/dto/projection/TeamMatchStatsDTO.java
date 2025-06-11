package com.soccer.fut7.soccer_system.team.dto.projection;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;

// TeamMatchStatsDTO.java
@Data
@AllArgsConstructor
public class TeamMatchStatsDTO {
    private UUID id;
    private UUID matchId;
    private UUID teamId;
    private Integer goals;
    private Integer goalsAgainst;
    private Integer points;
}