package com.soccer.fut7.soccer_system.ValueObject;
public record TeamName(String value) {
  

    public static TeamName of(String value) {
        return new TeamName(value);
    }
}