package com.soccer.fut7.soccer_system.dto.player;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;

public record PlayerMatchStatsRecordDto(
    UUID playerId,
    GoalsRecord goals,
    boolean attended,
    CardsRecord cards
) {}