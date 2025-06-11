package com.soccer.fut7.soccer_system.dto.utility;
import com.soccer.fut7.soccer_system.ValueObject.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DebtRecordDto(
    UUID Id,  // Typically generated server-side, no validation needed
    
    @NotNull(message = "Property ID cannot be null")
    UUID IdProperty,
    
    String nameProperty,
    
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    @Digits(integer = 10, fraction = 2, message = "Amount must have up to 10 integer and 2 decimal places")
    BigDecimal amount,
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description,
    
    @NotNull(message = "Due date cannot be null")
    LocalDate dueDate,
    
    LocalDate paidDate,  // Optional, validated in business logic
    
    @NotNull(message = "Debt status cannot be null")
    @Valid
    DebtStatus state
) {}