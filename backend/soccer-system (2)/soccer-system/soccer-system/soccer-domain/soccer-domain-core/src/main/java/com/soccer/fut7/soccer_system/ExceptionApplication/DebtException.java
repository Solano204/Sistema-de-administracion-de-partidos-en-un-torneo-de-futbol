package com.soccer.fut7.soccer_system.ExceptionApplication;

public class DebtException extends DomainException {
    public DebtException(String message) {
        super(message);
    }   

    public DebtException(String message, Throwable cause) {
        super(message, cause);
    }

    
}
