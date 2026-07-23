package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.helpers.PlayerCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.PlayerMapper;
import com.soccer.fut7.soccer_system.team.mapper.PlayerStatsMapper;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
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
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. PlayerAdapter's real logic is its
// team-existence validation ahead of register/update operations - single
// player (registerPlayerWithBasicInfo) checks by id via findById; every
// batch method (registerBatchPlayerWithBasicInfo and its 2 structural
// siblings) instead compares distinct-team-id COUNT against
// findAllById(...)'s result count. That count-based check is pinned down
// here including its actual blind spot: it can't tell you WHICH team is
// missing, only that the count doesn't match.
@ExtendWith(MockitoExtension.class)
class PlayerAdapterTest {

    @Mock private PlayerCommandHelperRepository playerCommandHelperRepository;
    @Mock private PlayerMapper playerMapper;
    @Mock private TeamRepositoryData teamRepositoryData;
    @Mock private PlayerStatsMapper playerStatsMapper;

    private PlayerAdapter playerAdapter;

    @BeforeEach
    void setUp() {
        playerAdapter = new PlayerAdapter(playerCommandHelperRepository, playerMapper, teamRepositoryData, playerStatsMapper);
    }

    @Test
    void registerPlayerWithBasicInfo_teamDoesNotExist_throwsIllegalArgumentException() {
        UUID teamId = UUID.randomUUID();
        Player player = Player.builder().id(UUID.randomUUID()).team(Team.builder().id(teamId).build()).build();
        when(teamRepositoryData.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playerAdapter.registerPlayerWithBasicInfo(player))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(teamId.toString());
        verifyNoInteractions(playerCommandHelperRepository);
    }

    @Test
    void registerPlayerWithBasicInfo_teamExists_attachesTheRealTeamEntityBeforeRegistering() {
        UUID teamId = UUID.randomUUID();
        Player player = Player.builder().id(UUID.randomUUID()).team(Team.builder().id(teamId).build()).build();
        TeamEntity teamEntity = TeamEntity.builder().id(teamId).build();
        PlayerEntity mappedPlayer = PlayerEntity.builder().build();
        PlayerEntity registered = PlayerEntity.builder().id(player.getId()).team(teamEntity).build();
        Player mappedBack = Player.builder().id(player.getId()).build();
        when(teamRepositoryData.findById(teamId)).thenReturn(Optional.of(teamEntity));
        when(playerMapper.toEntity(player)).thenReturn(mappedPlayer);
        when(playerCommandHelperRepository.registerPlayerWithBasicInfo(mappedPlayer)).thenReturn(Optional.of(registered));
        when(playerMapper.toDomain(registered)).thenReturn(mappedBack);

        Optional<Player> result = playerAdapter.registerPlayerWithBasicInfo(player);

        assertThat(mappedPlayer.getTeam()).isSameAs(teamEntity);
        assertThat(result).contains(mappedBack);
    }

    @Test
    void registerBatchPlayerWithBasicInfo_oneOfTwoTeamsMissing_throwsIllegalArgumentException() {
        UUID team1 = UUID.randomUUID();
        UUID team2 = UUID.randomUUID();
        Player player1 = Player.builder().id(UUID.randomUUID()).team(Team.builder().id(team1).build()).build();
        Player player2 = Player.builder().id(UUID.randomUUID()).team(Team.builder().id(team2).build()).build();
        // Only ONE of the two distinct teams comes back - count mismatch (1 != 2).
        when(teamRepositoryData.findAllById(anySet())).thenReturn(List.of(TeamEntity.builder().id(team1).build()));

        assertThatThrownBy(() -> playerAdapter.registerBatchPlayerWithBasicInfo(Set.of(player1, player2)))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(playerCommandHelperRepository);
    }

    @Test
    void registerBatchPlayerWithBasicInfo_allTeamsExist_delegatesToTheCommandHelperRepository() {
        UUID teamId = UUID.randomUUID();
        Player player = Player.builder().id(UUID.randomUUID()).team(Team.builder().id(teamId).build()).build();
        TeamEntity teamEntity = TeamEntity.builder().id(teamId).build();
        // mappedPlayer needs its own (placeholder) team set - the adapter
        // dereferences playerEntity.getTeam().getId() internally to find
        // the matching real TeamEntity to re-attach.
        PlayerEntity mappedPlayer = PlayerEntity.builder().team(TeamEntity.builder().id(teamId).build()).build();
        when(teamRepositoryData.findAllById(anySet())).thenReturn(List.of(teamEntity));
        when(playerMapper.toEntity(player)).thenReturn(mappedPlayer);
        when(playerCommandHelperRepository.registerBatchPlayerWithBasicInfo(anySet())).thenReturn(Optional.of(true));

        Optional<Boolean> result = playerAdapter.registerBatchPlayerWithBasicInfo(Set.of(player));

        assertThat(result).contains(true);
    }

    @Test
    void getPlayersOrganizedByPoints_delegatesDirectlyToTheCommandHelperRepository() {
        UUID categoryId = UUID.randomUUID();
        when(playerCommandHelperRepository.getPlayersOrganizedByPoints(categoryId)).thenReturn(List.of());

        assertThat(playerAdapter.getPlayersOrganizedByPoints(categoryId)).isEmpty();
    }

    @Test
    void deleteAllPlayersFromTeam_delegatesDirectlyToTheCommandHelperRepository() {
        UUID teamId = UUID.randomUUID();

        playerAdapter.deleteAllPlayersFromTeam(teamId);

        verify(playerCommandHelperRepository).deleteAllPlayersFromTeam(teamId);
    }
}
