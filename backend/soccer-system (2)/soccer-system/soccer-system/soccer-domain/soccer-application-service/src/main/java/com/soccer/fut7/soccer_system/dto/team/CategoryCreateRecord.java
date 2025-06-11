package com.soccer.fut7.soccer_system.dto.team;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.utility.AgeRangeRecord;

public record CategoryCreateRecord(
    UUID id,
    String name,
    AgeRangeRecord ageRange
) {}