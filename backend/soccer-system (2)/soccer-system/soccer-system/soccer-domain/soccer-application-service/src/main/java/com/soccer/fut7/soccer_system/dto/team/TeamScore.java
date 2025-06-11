package com.soccer.fut7.soccer_system.dto.team;

import java.util.UUID;

public record TeamScore(UUID teamId,String teamName, int goalsFor, int goalsAgainst, int points, String logo) {
}
