package com.soccer.fut7.soccer_system;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

// Pure unit tests. Found, not fixed: setPlayersTeam is never called anywhere
// in the backend (grepped the whole module) - this whole DomainService/
// DomainServiceImp pair is dead infrastructure. Worse, even taken at face
// value, the method's own body doesn't do what its name promises: it
// validates its arguments and then returns - it never actually calls
// player.setTeam(team) for anything in the players set. If this were ever
// wired up expecting it to assign players to a team, it would silently do
// nothing on valid input. Tested here anyway to pin down exactly that: the
// validation guards work, the "set" part of the name is a no-op.
class DomainServiceImpTest {

    private final DomainServiceImp domainService = new DomainServiceImp();

    @Test
    void setPlayersTeam_nullPlayers_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> domainService.setPlayersTeam(null, Team.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Players cannot be null or empty");
    }

    @Test
    void setPlayersTeam_emptyPlayers_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> domainService.setPlayersTeam(Set.of(), Team.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Players cannot be null or empty");
    }

    @Test
    void setPlayersTeam_nullTeam_throwsIllegalArgumentException() {
        Set<Player> players = Set.of(Player.builder().id(UUID.randomUUID()).build());

        assertThatThrownBy(() -> domainService.setPlayersTeam(players, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Team cannot be null");
    }

    @Test
    void setPlayersTeam_validArguments_doesNotActuallyAssignTheTeamToAnyPlayer() {
        Player player = Player.builder().id(UUID.randomUUID()).build();
        Team team = Team.builder().id(UUID.randomUUID()).build();

        assertThatCode(() -> domainService.setPlayersTeam(Set.of(player), team)).doesNotThrowAnyException();
        // The real finding: player.getTeam() is still null afterwards - the
        // method validates and returns, it never calls player.setTeam(team).
        assertThat(player.getTeam()).isNull();
    }
}
