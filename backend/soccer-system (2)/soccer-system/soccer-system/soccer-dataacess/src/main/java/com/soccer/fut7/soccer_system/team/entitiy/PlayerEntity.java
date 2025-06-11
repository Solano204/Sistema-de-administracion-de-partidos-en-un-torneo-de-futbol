package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "players", schema = "fut_jaguar")
public class PlayerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "jersey_number", nullable = false)
    private Integer jerseyNumber;

    @ManyToOne
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JoinColumn(name = "team_id", nullable = false)
    private TeamEntity team;

    @Column(name = "age", nullable = false)
    private Integer age = 0;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "player_status", nullable = false)
    private String playerStatus = PlayerStatus.ACTIVO.toString();

    @Column(name = "captain", nullable = false)
    private Boolean captain = false; // Changed from "Captian" to "captain"

    @Column(name = "email")
    private String email;

    // One-to-One relationship with PlayerStats
    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PlayerStatsEntity playerStats;

}