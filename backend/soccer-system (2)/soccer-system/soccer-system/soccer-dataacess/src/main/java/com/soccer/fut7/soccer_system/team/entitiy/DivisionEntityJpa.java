package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;

@Entity
@Data
@Table(name = "divisions", schema = "fut_jaguar")
public class DivisionEntityJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private TournamentEntity tournament;

    @Column(name = "division_name", nullable = false, length = 20)
    private String divisionName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "current_phase")
    private String currentPhase; 
    
    @Column(name = "next_phase")
    private String nextPhase; 
    
}
