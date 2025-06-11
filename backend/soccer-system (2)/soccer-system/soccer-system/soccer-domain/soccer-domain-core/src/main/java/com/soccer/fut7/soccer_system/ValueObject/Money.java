package com.soccer.fut7.soccer_system.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.channels.Pipe;
import java.util.Currency;
import java.util.Objects;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;

public record Money(BigDecimal amount, Currency currency) {

    // Force MX currency regardless of input
    public Money {
        Objects.requireNonNull(amount, "Amount cannot be null");
        
        // Always use MX currency
        currency = Currency.getInstance("MXN");  // MXN is the ISO code for Mexican Peso
        
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        
        // Scale validation for MX Peso (2 decimal places)
        if (amount.scale() > 2) {
            amount = amount.setScale(2, RoundingMode.HALF_EVEN);
        }
    }

    // Factory methods that will automatically use MX currency
    public static Money of(BigDecimal amount) {
        return new Money(amount, Currency.getInstance("MXN"));
    }

    public static Money of(String amount) {
        try {
            return new Money(new BigDecimal(amount), Currency.getInstance("MXN"));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount format", e);
        }
    }

    public static Money of(double amount) {
        return new Money(BigDecimal.valueOf(amount), Currency.getInstance("MXN"));
    }

    // Arithmetic operations remain the same since currency is now always MX
    public Money add(Money other) {
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        BigDecimal newAmount = this.amount.subtract(other.amount);
        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Resulting amount cannot be negative");
        }
        return new Money(newAmount, this.currency);
    }

    // Other methods remain unchanged...
    public Money multiply(double multiplier) {
        if (multiplier < 0) {
            throw new IllegalArgumentException("Multiplier cannot be negative");
        }
        return new Money(this.amount.multiply(BigDecimal.valueOf(multiplier)), this.currency);
    }

    // Formatting for MX currency
    public String format() {
        return String.format("$%.2f MXN", amount);  // Mexican Peso format
    }

    // No need for currency validation since we only have one currency
    // Removed validateSameCurrency() method

    // Constants
    public static final Currency MX = Currency.getInstance("MXN");
}