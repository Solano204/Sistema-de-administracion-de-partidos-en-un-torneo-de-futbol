package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

import com.fasterxml.jackson.databind.deser.DataFormatReaders.Match;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "team_stats", schema = "fut_jaguar")
public class TeamStatsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TeamEntity team;
    @ManyToOne
    @JoinColumn(name = "division_id")
    private DivisionEntityJpa division;
    @Column(name = "goals_for", nullable = false)
    private Integer goals = 0;

    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst = 0;

    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;

    @Column(name = "matches_won", nullable = false)
    private Integer matchesWon = 0;

    @Column(name = "matches_drawn", nullable = false)
    private Integer matchesDrawn = 0;

    @Column(name = "matches_lost", nullable = false)
    private Integer matchesLost = 0;

    @Column(name = "points", nullable = false)
    private Integer points = 0;


    @Column(name = "position")
    private Integer position;

    @Column(name = "qualified_next_round")
    private Boolean qualifiedNextRound = false;
}