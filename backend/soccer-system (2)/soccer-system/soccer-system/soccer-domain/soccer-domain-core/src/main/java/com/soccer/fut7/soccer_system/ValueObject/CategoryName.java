
package com.soccer.fut7.soccer_system.ValueObject;

import lombok.*;

public record CategoryName(String value) {
   

    public static CategoryName of(String value) {
        return new CategoryName(value);
    }
}