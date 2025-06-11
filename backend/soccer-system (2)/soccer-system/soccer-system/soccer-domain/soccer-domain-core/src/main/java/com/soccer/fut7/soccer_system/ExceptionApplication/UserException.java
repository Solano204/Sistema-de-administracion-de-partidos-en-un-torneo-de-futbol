package com.soccer.fut7.soccer_system.ExceptionApplication;

public class UserException extends DomainException{
    
    public UserException(String message) {
        super(message);
    }    
    
    public UserException(String message, Throwable cause) {
        super(message, cause);
    }
    
    
}
