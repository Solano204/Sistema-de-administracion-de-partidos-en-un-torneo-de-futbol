package com.soccer.fut7.soccer_system.EntityApplication;
import java.rmi.server.UID;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Debt extends BaseEntity {
    private UUID id;
    private DebtStatus status;
    private Money amount;
    private String description;
    private DebtDate dueDate;
    private DebtDate paidDate;
    
    protected void validateDebt() {
        if (status == null) {
            throw new IllegalArgumentException("Debt status cannot be null");
        }
        
    }
}

