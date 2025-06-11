package com.soccer.fut7.soccer_system.ValueObject;
import java.util.UUID;

public record TeamStatsId(UUID value) {
    public TeamStatsId {
        if (value == null) {
            throw new IllegalArgumentException("Team Stats ID cannot be null");
        }
    }

    public static TeamStatsId of(UUID id) {
        return new TeamStatsId(id);
    }

    public static TeamStatsId generateNew() {
        return new TeamStatsId(UUID.randomUUID());
    }
}