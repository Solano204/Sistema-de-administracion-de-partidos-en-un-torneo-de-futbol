package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.UUID;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlayerDebt extends Debt {
    private UUID playerId;
    private String name;
    protected void validatePlayerDebt() {
        super.validateDebt();
    }
}