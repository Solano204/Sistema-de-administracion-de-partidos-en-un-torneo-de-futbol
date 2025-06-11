package com.soccer.fut7.soccer_system.team.dto.projection;

import lombok.Data;
import java.util.UUID;

@Data
public class RefereeDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    // Add other referee fields you need
}