package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.ExceptionApplication.PlayerException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.PlayerRepository;
import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - covers CommandHelperPlayer's
// team-existence guards ahead of batch/removal operations, the one class of
// real orchestration logic here (the rest is repository+mapper delegation).
@ExtendWith(MockitoExtension.class)
class CommandHelperPlayerTest {

    @Mock private EntityDtoMapperDomain mapper;
    @Mock private PlayerRepository playerRepository;
    @Mock private TeamRepository teamRepository;

    private CommandHelperPlayer commandHelperPlayer;

    @BeforeEach
    void setUp() {
        commandHelperPlayer = new CommandHelperPlayer(mapper, playerRepository, teamRepository);
    }

    @Test
    void deleteAllPlayersFromTeam_teamDoesNotExist_throwsPlayerExceptionAndNeverDeletes() {
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.deleteAllPlayersFromTeam(teamId))
                .isInstanceOf(PlayerException.class);
        verify(playerRepository, never()).deleteAllPlayersFromTeam(any());
    }

    @Test
    void deleteAllPlayersFromTeam_teamExists_delegatesToRepository() {
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.of(true));

        commandHelperPlayer.deleteAllPlayersFromTeam(teamId);

        verify(playerRepository).deleteAllPlayersFromTeam(teamId);
    }

    @Test
    void removePlayerFromTeam_playerDoesNotExist_throwsPlayerExceptionAndNeverRemoves() {
        UUID playerId = UUID.randomUUID();
        when(playerRepository.getPlayerFullDetails(playerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.removePlayerFromTeam(playerId))
                .isInstanceOf(PlayerException.class);
        verify(playerRepository, never()).removePlayerFromTeam(any());
    }

    @Test
    void createBasicInformationBatchDetails_teamDoesNotExist_throwsTeamExceptionAndNeverRegisters() {
        UUID teamId = UUID.randomUUID();
        Set<PlayerCreateRecord> players = Set.of();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.createBasicInformationBatchDetails(players, teamId))
                .isInstanceOf(teamException.class);
        verify(playerRepository, never()).registerBatchPlayerWithBasicInfo(any());
    }

    @Test
    void removePlayersFromTeam_teamDoesNotExist_throwsTeamExceptionAndNeverRemoves() {
        UUID teamId = UUID.randomUUID();
        List<UUID> playerIds = List.of(UUID.randomUUID());
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.removePlayersFromTeam(teamId, playerIds))
                .isInstanceOf(teamException.class);
        verify(playerRepository, never()).removePlayersFromTeam(any(), any());
    }

    @Test
    void getPlayerFullDetails_notFound_throwsPlayerException() {
        UUID playerId = UUID.randomUUID();
        when(playerRepository.getPlayerFullDetails(playerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.getPlayerFullDetails(playerId))
                .isInstanceOf(PlayerException.class);
    }

    @Test
    void registerBasicPlayer_mapsThenInitializesDefaultsBeforeSaving() {
        PlayerCreateRecord record = new PlayerCreateRecord(null, "Carlos", "Perez", null, 10, 20, null, null, false, null);
        Player mapped = Player.builder().build();
        Player saved = Player.builder().id(UUID.randomUUID()).build();
        when(mapper.playerCreateRecordToPlayer(record)).thenReturn(mapped);
        when(playerRepository.registerPlayerWithBasicInfo(mapped)).thenReturn(Optional.of(saved));

        Player result = commandHelperPlayer.registerBasicPlayer(record);

        verify(mapper).initializePlayerDefaults(mapped);
        assertThat(result).isSameAs(saved);
    }

    @Test
    void registerBasicPlayer_repositoryFailsToSave_throwsPlayerException() {
        PlayerCreateRecord record = new PlayerCreateRecord(null, "Carlos", "Perez", null, 10, 20, null, null, false, null);
        Player mapped = Player.builder().build();
        when(mapper.playerCreateRecordToPlayer(record)).thenReturn(mapped);
        when(playerRepository.registerPlayerWithBasicInfo(mapped)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperPlayer.registerBasicPlayer(record))
                .isInstanceOf(PlayerException.class);
    }
}
