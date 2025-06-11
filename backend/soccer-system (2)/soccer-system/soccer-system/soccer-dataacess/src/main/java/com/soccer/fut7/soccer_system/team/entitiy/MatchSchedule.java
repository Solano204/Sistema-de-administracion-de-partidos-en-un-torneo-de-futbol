package com.soccer.fut7.soccer_system.team.entitiy;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
@Data@Entity
@Table(name = "weekly_schedule", schema = "fut_jaguar")
public class MatchSchedule {
    @Id
    @GeneratedValue
@Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @Column(name = "match_id", columnDefinition = "uuid")
    private UUID matchId;

    @Column(name = "tournament_id", columnDefinition = "uuid")
    private UUID tournamentId;

    @Column(name = "match_day", length = 10)
    private String matchDay;

    @Column(name = "match_date")
    private LocalDate matchDate;

    @Column(name = "match_time")
    private LocalTime matchTime;

    @Column(name = "home_team_name", length = 100)
    private String homeTeamName;

    @Column(name = "away_team_name", length = 100)
    private String awayTeamName;

    @Column(name = "tournament_name", length = 100)
    private String tournamentName;

    @Column(name = "category_name", length = 100)
    private String categoryName;

    @Column(name = "phase", length = 20)
    private String phase;

    @Column(name = "status", length = 20)
    private String status = "PENDIENTE";
}