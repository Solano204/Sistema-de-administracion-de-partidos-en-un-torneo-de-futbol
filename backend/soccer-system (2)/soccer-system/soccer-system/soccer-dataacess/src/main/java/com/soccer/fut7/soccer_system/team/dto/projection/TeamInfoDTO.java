package com.soccer.fut7.soccer_system.team.dto.projection;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class TeamInfoDTO {
    private UUID id;
    private String teamName;
    private String logoUrl;


    public TeamInfoDTO(UUID id, String teamName, String logoUrl) {
        this.id = id;
        this.teamName = teamName;
        this.logoUrl = logoUrl;
    }
    
}