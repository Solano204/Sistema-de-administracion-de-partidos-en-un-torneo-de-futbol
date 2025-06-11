package com.soccer.fut7.soccer_system.ExceptionApplication;

public class CredentialException extends DomainException {
    
    public CredentialException(String message) {
        super(message);
    }
    public CredentialException(String message, Throwable cause) {
        super(message, cause);
    }
}
