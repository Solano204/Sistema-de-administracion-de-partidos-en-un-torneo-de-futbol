package com.soccer.fut7.soccer_system.dto.team;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;

public record TeamCreateRecord(
    UUID id,
    String name,
    UUID categoryId,
    Set<PlayerCreateRecord> players,
    String logo
) {}