package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerStatsUpdateRequest;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.PlayerApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - updatePlayerPositionStats unpacking
// PlayerStatsUpdateRequest into 3 separate service arguments is this
// controller's one non-trivial transformation; the rest is pure delegation
// already effectively covered at CommandHelperPlayerTest.
@ExtendWith(MockitoExtension.class)
class PlayerControllerTest {

    @Mock private PlayerApplicationService playerApplicationService;

    private PlayerController playerController;

    @BeforeEach
    void setUp() {
        playerController = new PlayerController(playerApplicationService);
    }

    @Test
    void registerBasicPlayer_delegatesTheCreateRecordAndReturnsTheResultDirectly() {
        PlayerCreateRecord record = new PlayerCreateRecord(null, "Carlos", "Perez", null, 10, 20, null, null, false, null);
        Player created = Player.builder().build();
        when(playerApplicationService.registerBasicPlayer(record)).thenReturn(created);

        assertThat(playerController.registerBasicPlayer(record)).isSameAs(created);
    }

    @Test
    void updatePlayerPositionStats_unpacksTheRequestIntoTheThreeExpectedArguments() {
        UUID playerId = UUID.randomUUID();
        GoalsRecord goals = mock(GoalsRecord.class);
        PointsRecord points = mock(PointsRecord.class);
        CardsRecord cards = mock(CardsRecord.class);
        PlayerStatsUpdateRequest request = new PlayerStatsUpdateRequest(goals, points, cards);
        Player updated = Player.builder().id(playerId).build();
        when(playerApplicationService.updatePlayerPositionStats(playerId, goals, points, cards)).thenReturn(updated);

        Player result = playerController.updatePlayerPositionStats(playerId, request);

        assertThat(result).isSameAs(updated);
    }

    @Test
    void deleteAllPlayersFromTeam_delegatesDirectlyToTheService() {
        UUID teamId = UUID.randomUUID();

        playerController.deleteAllPlayersFromTeam(teamId);

        verify(playerApplicationService).deleteAllPlayersFromTeam(teamId);
    }

    @Test
    void removePlayersFromTeam_delegatesTeamIdAndPlayerIdsInOrder() {
        UUID teamId = UUID.randomUUID();
        List<UUID> playerIds = List.of(UUID.randomUUID(), UUID.randomUUID());

        playerController.removePlayersFromTeam(teamId, playerIds);

        verify(playerApplicationService).removePlayersFromTeam(teamId, playerIds);
    }

    @Test
    void createBasicInformationIdPlayer_delegatesPlayerSetAndTeamIdInOrder() {
        Set<PlayerCreateRecord> players = Set.of();
        UUID teamId = UUID.randomUUID();
        when(playerApplicationService.createBasicInformationBatchDetails(players, teamId)).thenReturn(true);

        assertThat(playerController.createBasicInformationIdPlayer(players, teamId)).isTrue();
    }
}
