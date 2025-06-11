package com.soccer.fut7.soccer_system.EntityApplication;

import java.rmi.server.UID;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefereePayment extends BaseEntity {
    private UUID idPayment;
    private User referee;
    private PaymentDate paymentDate;
    private double hoursWorked;
    private Money hourlyRate;
    private Money amount;
    private UUID matchId;
    protected void validateRefereePayment() {
        
        if (referee == null) {
            throw new IllegalArgumentException("Referee cannot be null");
        }
        if (paymentDate == null) {
            throw new IllegalArgumentException("Payment date cannot be null");
        }
        if (hoursWorked <= 0) {
            throw new IllegalArgumentException("Hours worked must be positive");
        }
    
        
        // Validate that amount equals hoursWorked * hourlyRate
        Money calculatedAmount = hourlyRate.multiply(hoursWorked);
        if (!amount.equals(calculatedAmount)) {
            throw new IllegalArgumentException("Amount must equal hours worked multiplied by hourly rate");
        }
    }
}