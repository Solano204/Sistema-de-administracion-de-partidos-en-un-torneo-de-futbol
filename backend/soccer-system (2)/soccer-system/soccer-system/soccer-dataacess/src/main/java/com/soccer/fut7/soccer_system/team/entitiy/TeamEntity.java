package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "teams", schema = "fut_jaguar")
public class TeamEntity {
  @Id
  @GeneratedValue(generator = "UUID")
  @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
  @Column(columnDefinition = "uuid", updatable = false)
  private UUID id;

  @Column(name = "team_name", nullable = false, length = 100)
  private String teamName;

  @Column(name = "logo_url", length = 255)
  private String logoUrl;

  @ManyToOne
  @JoinColumn(name = "category_id", nullable = false)
  private CategoryEntity category;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<PlayerEntity> players;
  @ManyToOne
  @JoinColumn(name = "tournament_id")
  private TournamentEntity tournament;

  @Column(name = "active")
  private Boolean active = true;
  @Column(name = "number_of_players", nullable = false)
  private Integer numberOfPlayers = 0;
  // One-to-One relationship with TeamStats
  @OneToOne(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private TeamStatsEntity teamStats;

  public void addPlayer(PlayerEntity player) {
    this.players.add(player);
    player.setTeam(this);
    this.numberOfPlayers = this.players.size(); // Update count
  }
}