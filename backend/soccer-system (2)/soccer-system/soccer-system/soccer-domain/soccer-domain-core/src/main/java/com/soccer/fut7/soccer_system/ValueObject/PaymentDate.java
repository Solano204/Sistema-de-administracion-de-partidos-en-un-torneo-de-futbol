package com.soccer.fut7.soccer_system.ValueObject;
import java.time.LocalDate;
public record PaymentDate(LocalDate value) {
    

    public static PaymentDate of(LocalDate value) {
        return new PaymentDate(value);
    }
}