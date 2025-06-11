package com.soccer.fut7.soccer_system.ValueObject;

public enum PlayerStatus {
    ACTIVO,
    LESIONADO, // Ensure this is defined here
    INACTIVO;

    // Optionally, you can add a method to handle string matching more gracefully
    public static PlayerStatus fromString(String status) {
        try {
            return PlayerStatus.valueOf(status.toUpperCase()); // Case-insensitive handling
        } catch (IllegalArgumentException e) {
            // Handle the exception or return a default status
            return ACTIVO; // Default status or custom behavior
        }
    }
}