
package com.soccer.fut7.soccer_system.ValueObject;

import lombok.*;

public record ContactInfo(Email email, PhoneNumber phoneNumber, Address address) {
    public ContactInfo {
        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        if (phoneNumber == null) {
            throw new IllegalArgumentException("Phone number cannot be null");
        }
        if (address == null) {
            throw new IllegalArgumentException("Address cannot be null");
        }
    }

    public static ContactInfo of(Email email, PhoneNumber phoneNumber, Address address) {
        return new ContactInfo(email, phoneNumber, address);
    }
}