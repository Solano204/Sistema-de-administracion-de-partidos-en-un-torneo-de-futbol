
package com.soccer.fut7.soccer_system.ValueObject;
public record PhoneNumber(String value) {
    public PhoneNumber {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be null or empty");
        }
        if (!value.matches("^\\+?[0-9]{10,15}$")) {
            throw new IllegalArgumentException("Invalid phone number format");
        }
    }

    public static PhoneNumber of(String value) {
        return new PhoneNumber(value);
    }
}