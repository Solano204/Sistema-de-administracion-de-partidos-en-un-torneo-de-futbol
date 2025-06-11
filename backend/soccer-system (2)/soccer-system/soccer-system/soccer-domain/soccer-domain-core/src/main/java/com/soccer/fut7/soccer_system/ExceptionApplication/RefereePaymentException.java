package com.soccer.fut7.soccer_system.ExceptionApplication;

public class RefereePaymentException  extends DomainException {
    
    public RefereePaymentException(String message) {
        super(message);
    }

    public RefereePaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}
