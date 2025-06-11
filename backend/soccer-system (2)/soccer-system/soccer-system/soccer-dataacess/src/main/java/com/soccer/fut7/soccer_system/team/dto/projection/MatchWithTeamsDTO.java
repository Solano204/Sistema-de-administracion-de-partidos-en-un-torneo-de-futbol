package com.soccer.fut7.soccer_system.team.dto.projection;

// MatchWithTeamsDTO.java

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class MatchWithTeamsDTO {
    private UUID id;
    private LocalDate matchDate;
    private UUID refereeId;
    public TeamInfoDTO homeTeam;
    public TeamInfoDTO awayTeam;

    public MatchWithTeamsDTO(UUID id, LocalDate matchDate, UUID refereeId, TeamInfoDTO homeTeam, TeamInfoDTO awayTeam) {
        this.id = id;
        this.matchDate = matchDate;
        this.refereeId = refereeId;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
    }
}