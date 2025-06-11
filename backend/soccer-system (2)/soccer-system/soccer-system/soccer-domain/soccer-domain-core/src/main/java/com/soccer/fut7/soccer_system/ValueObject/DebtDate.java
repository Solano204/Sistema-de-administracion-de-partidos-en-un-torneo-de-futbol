
package com.soccer.fut7.soccer_system.ValueObject;

import java.time.LocalDate;

public record DebtDate(LocalDate value) {

    public static DebtDate of(LocalDate value) {
        return new DebtDate(value);
    }
    
    public static DebtDate of(String value) {
        return new DebtDate(LocalDate.parse(value));
    }


    public static DebtDate of(int year, int month, int day) {
        return new DebtDate(LocalDate.of(year, month, day));
    }
 
}