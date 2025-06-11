
package com.soccer.fut7.soccer_system.dto.match;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;


public record WeekRecord(MatchTinyDetails match) {}