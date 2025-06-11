package com.soccer.fut7.soccer_system.ExceptionApplication;

public class categoryException extends DomainException {
    
    public categoryException(String message) {
        super(message);
    }

    public categoryException(String message, Throwable cause) {
        super(message, cause);
    }
}
