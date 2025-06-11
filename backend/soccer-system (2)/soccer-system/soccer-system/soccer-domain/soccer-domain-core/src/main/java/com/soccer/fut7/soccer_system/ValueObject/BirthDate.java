
package com.soccer.fut7.soccer_system.ValueObject;

import java.time.LocalDate;
import java.time.Period;

import lombok.*;

public record BirthDate(LocalDate value) {
    

    public static BirthDate of(LocalDate value) {
        return new BirthDate(value);
    }

    public int calculateAge() {
        return Period.between(value, LocalDate.now()).getYears();
    }
}