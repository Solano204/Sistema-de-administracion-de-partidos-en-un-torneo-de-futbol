package com.soccer.fut7.soccer_system.ExceptionApplication;

public class PlayerException extends DomainException {

    public PlayerException(String message) {
        super(message);
    }

    public PlayerException(String message, Throwable cause) {
        super(message, cause);
    }
}
