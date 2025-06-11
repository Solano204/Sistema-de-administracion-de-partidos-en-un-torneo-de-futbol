

package com.soccer.fut7.soccer_system.ValueObject;

import lombok.*;

public record Email(String value) {
   

    public static Email of(String value) {
        return new Email(value);
    }
}
