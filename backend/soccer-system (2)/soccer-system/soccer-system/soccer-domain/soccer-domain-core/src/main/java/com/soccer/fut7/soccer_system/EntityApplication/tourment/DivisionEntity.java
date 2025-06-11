package com.soccer.fut7.soccer_system.EntityApplication.tourment;
import lombok.Data;

import java.util.UUID;
@Data
public class DivisionEntity {
    private UUID id;

    private UUID tournamentId;

    private String divisionName;

    private String currentPhase;
    private String nextPhase;
}