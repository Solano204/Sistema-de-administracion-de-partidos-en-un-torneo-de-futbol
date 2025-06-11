
package com.soccer.fut7.soccer_system.ValueObject;

import lombok.*;
public record CategoryDescription(String value) {
    public CategoryDescription {
        if (value == null) {
            value = "";
        }
    }

    public static CategoryDescription of(String value) {
        return new CategoryDescription(value);
    }
}