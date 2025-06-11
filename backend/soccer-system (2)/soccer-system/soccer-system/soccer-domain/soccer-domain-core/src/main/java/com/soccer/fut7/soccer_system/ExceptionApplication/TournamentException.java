package com.soccer.fut7.soccer_system.ExceptionApplication;

public class TournamentException extends RuntimeException {
    
    public TournamentException(String message) {
        super(message);
    }
    
    public TournamentException(String message, Throwable cause) {
        super(message, cause);
    }
}