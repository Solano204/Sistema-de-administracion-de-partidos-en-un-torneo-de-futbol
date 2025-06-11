
package com.soccer.fut7.soccer_system.ValueObject;

public record AgeRange(int minAge, int maxAge) {
   

    public static AgeRange of(int minAge, int maxAge) {
        return new AgeRange(minAge, maxAge);
    }
}