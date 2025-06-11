package com.soccer.fut7.soccer_system.dto.category;

import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.AgeRangeRecord;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryInfoRecord(
    UUID id,  // Not validated as it's typically generated server-side
    
    @NotBlank(message = "Category name cannot be empty")
    @Size(min = 2, max = 50, message = "Category name must be between {min} and {max} characters")
   
    String name,
    
    // @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$|^$", 
    //          message = "Invalid URL format (leave empty if no image)")
    String imageUrl,
    
    @NotNull(message = "Age range cannot be null")
        @Valid  // THIS IS CRUCIAL FOR NESTED VALIDATION
    AgeRangeRecord ageRange
) {}