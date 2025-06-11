package com.soccer.fut7.soccer_system.team.entitiy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

// JPA Entity
@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "inscription", schema = "fut_jaguar")
public class InscriptionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;
    
    @Column(name = "name_team", nullable = false, length = 100)
    private String nameTeam;
    
    @Column(name = "num_player", nullable = false)
    private Integer numPlayer;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    // @Column(name = "created_at", updatable = false)
    // private LocalDate createdAt;
    
    // @Column(name = "updated_at")
    // private LocalDate updatedAt;
}