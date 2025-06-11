package com.soccer.fut7.soccer_system.EntityApplication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.InfoTeamMatch;
import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchResults {
    private UUID idMatch;
    private InfoTeamMatch homeTeam;
    private InfoTeamMatch awayTeam;
    private UUID refereeId;
    private LocalDate matchDate;
    private MatchStatus status;
}
