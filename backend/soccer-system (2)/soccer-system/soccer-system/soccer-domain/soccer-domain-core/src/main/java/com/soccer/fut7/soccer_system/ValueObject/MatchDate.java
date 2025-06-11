package com.soccer.fut7.soccer_system.ValueObject;

import java.time.LocalDate;

public record MatchDate(LocalDate value) {
    public MatchDate {

    }

    public static MatchDate of(LocalDate value) {
        return new MatchDate(value);
    }
}