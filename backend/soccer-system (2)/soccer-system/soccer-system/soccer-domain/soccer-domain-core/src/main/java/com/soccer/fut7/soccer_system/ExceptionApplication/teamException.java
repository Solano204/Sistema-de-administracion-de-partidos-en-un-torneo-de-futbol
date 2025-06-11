package com.soccer.fut7.soccer_system.ExceptionApplication;

public class teamException extends DomainException {

    public teamException(String message) {
        super(message);
    }

    public teamException(String message, Throwable cause) {
        super(message, cause);
    }
    
}
