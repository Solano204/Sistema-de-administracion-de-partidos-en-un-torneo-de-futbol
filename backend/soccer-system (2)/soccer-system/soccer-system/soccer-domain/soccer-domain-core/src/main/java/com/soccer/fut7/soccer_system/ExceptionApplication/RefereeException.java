package com.soccer.fut7.soccer_system.ExceptionApplication;

public class RefereeException extends DomainException {
    
    public RefereeException(String message) {
        super(message);
    }

    public RefereeException(String message, Throwable cause) {
        super(message, cause);
    }
}
