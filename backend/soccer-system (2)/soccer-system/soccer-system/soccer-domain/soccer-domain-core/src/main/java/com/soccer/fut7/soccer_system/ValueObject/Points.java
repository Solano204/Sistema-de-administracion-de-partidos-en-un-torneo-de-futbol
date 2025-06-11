package com.soccer.fut7.soccer_system.ValueObject;

public record Points(int value) {
    

    public static Points of(int value) {
        return new Points(value);
    }

    public static Points zero() {
        return new Points(0);
    }
}