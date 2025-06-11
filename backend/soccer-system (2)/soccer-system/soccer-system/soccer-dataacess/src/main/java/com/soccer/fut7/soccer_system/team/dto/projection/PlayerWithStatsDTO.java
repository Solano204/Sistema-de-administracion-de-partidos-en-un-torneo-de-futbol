package com.soccer.fut7.soccer_system.team.dto.projection;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;

// PlayerWithStatsDTO.java
@Data
@AllArgsConstructor
public class PlayerWithStatsDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private Integer jerseyNumber;
    private UUID teamId;
    private Integer goals;
    private Integer points;
    private Integer yellowCards;
    private Integer redCards;
    private Boolean attended;
}
