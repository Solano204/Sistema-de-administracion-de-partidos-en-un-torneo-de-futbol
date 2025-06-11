package com.soccer.fut7.soccer_system.team.dto.projection;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class JourneyDTO {
    private UUID id;
    private Integer journeyNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    // Add other journey fields you need
}
