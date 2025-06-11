package com.soccer.fut7.soccer_system.EntityApplication.tourment;

import java.rmi.server.UID;
import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class TourmentEntity {
    private UUID id;
    private String tournamentName;
    private String categoryName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String phase;
    private UUID categoryId;
}
