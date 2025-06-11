package com.soccer.fut7.soccer_system.dto.referee;

import java.util.UUID;

public record UserRefereeSummaryRecord(
    UUID id,
    String fullName
) {}