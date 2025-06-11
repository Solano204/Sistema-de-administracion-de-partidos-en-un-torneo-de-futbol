
package com.soccer.fut7.soccer_system.ExceptionApplication;

public class TokenException extends DomainException {
    public TokenException(String message) {
        super(message);
    }
    public TokenException(String message, Throwable cause) {
        super(message, cause);
    }
}