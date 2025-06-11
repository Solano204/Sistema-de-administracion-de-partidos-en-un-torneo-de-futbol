package com.soccer.fut7.soccer_system.ExceptionApplication;

public class PlayerStatsException extends DomainException {

    public PlayerStatsException(String message) {
        super(message);
    }

    public PlayerStatsException(String message, Throwable cause) {
        super(message, cause);
    }
}
