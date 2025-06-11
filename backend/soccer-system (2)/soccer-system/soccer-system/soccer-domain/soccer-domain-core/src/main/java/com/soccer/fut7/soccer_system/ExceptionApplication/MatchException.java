package com.soccer.fut7.soccer_system.ExceptionApplication;

public class MatchException extends DomainException{
    
    public MatchException(String message) {
        super(message);
    }

    
    public MatchException(String message, Throwable cause) {
        super(message, cause);
}
}
