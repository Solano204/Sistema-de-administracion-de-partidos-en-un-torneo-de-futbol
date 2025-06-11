package com.soccer.fut7.soccer_system.dto.player;

import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

public record PlayerStatsUpdateRequest(
    GoalsRecord goalsRecord,
    PointsRecord pointsRecord,
    CardsRecord card
) {}
