package com.soccer.fut7.soccer_system.dto.utility;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AgeRangeRecord(
    @NotNull(message = "Minimum age is required")
    @Min(value = 0, message = "Minimum age must be 0 or greater")
    @Max(value = 150, message = "Minimum age cannot exceed 150")
    Integer minAge,
    
    @NotNull(message = "Maximum age is required")
    @Min(value = 1, message = "Maximum age must be 1 or greater")
    @Max(value = 150, message = "Maximum age cannot exceed 150")
    Integer maxAge
) {
    // Custom validation method
    public boolean isValid() {
        return minAge != null && maxAge != null && maxAge > minAge;
    }
}