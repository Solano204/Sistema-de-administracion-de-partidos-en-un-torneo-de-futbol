

package com.soccer.fut7.soccer_system.ValueObject;
public record JerseyNumber(int value) {
  

    public static JerseyNumber of(int value) {
        return new JerseyNumber(value);
    }
}