package com.soccer.fut7.soccer_system.ValueObject;
public record Goals(int value) {
    
    public static Goals of(int value) {
        return new Goals(value);
    }

    public static Goals zero() {
        return new Goals(0);
    }
}