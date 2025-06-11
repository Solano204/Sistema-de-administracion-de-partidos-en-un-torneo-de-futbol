package com.soccer.fut7.soccer_system.ValueObject;

public enum MatchStatus {
    JUGADO,
    POSPONIDO,
    PENDIENTE,
    SELECCIONADO,
    CANCELADO;
    public static MatchStatus fromString(String status) {
        try {
            return MatchStatus.valueOf(status.toUpperCase()); // Case-insensitive handling
        } catch (IllegalArgumentException e) {
            // Handle the exception or return a default status
            return JUGADO; // Default status or custom behavior
        }
    }
}