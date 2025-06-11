package com.soccer.fut7.soccer_system.ValueObject; 
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Period;
import java.util.UUID;

public record PersonName(String firstName, String lastName) {
   

    public static PersonName of(String firstName, String lastName) {
        return new PersonName(firstName, lastName);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}