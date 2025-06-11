package com.soccer.fut7.soccer_system.dto.match;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


public record MatchCreateRecord(
    LocalDate matchDate,
    UUID refereeId,
    UUID categoryId,
    UUID matchId,
    UUID homeTeamId,
    UUID awayTeamId
    
) {}