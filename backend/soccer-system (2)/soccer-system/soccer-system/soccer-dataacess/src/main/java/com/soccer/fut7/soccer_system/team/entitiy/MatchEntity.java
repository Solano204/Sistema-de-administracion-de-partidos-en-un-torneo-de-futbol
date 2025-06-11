package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "matches", schema = "fut_jaguar")
public class MatchEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    
    @ManyToOne
    @JoinColumn(name = "referee_id")
    private UserEntity referee;
    @ManyToOne
    @JoinColumn(name = "home_team_id", nullable = false)
    private TeamEntity homeTeam;

    @ManyToOne
    @JoinColumn(name = "away_team_id", nullable = false)
    private TeamEntity awayTeam;

    @Transient
    private TeamMatchStatsEntity homeTeamStats;

    @Transient
    private TeamMatchStatsEntity awayTeamStats;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private TournamentEntity tournament;

    @ManyToOne
    @JoinColumn(name = "journey_id")
    private JourneyEntity journey;

    @ManyToOne
    @JoinColumn(name = "winner_team_id")
    private TeamEntity winnerTeam;

    @Column(name = "phase", nullable = false, length = 20)
    private String phase = "ROUND_ROBIN";

    @Column(name = "status", nullable = false, length = 20)
    private String matchStatus = MatchStatus.PENDIENTE.toString();

}
