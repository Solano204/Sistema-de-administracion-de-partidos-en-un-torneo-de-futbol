package com.soccer.fut7.soccer_system;

import java.util.Set;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;

public interface DomainService {
    void setPlayersTeam(Set<Player> players, Team team);
}
