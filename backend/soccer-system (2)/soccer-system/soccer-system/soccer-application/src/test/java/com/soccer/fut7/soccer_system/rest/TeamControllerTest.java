package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.ports.input.service.TeamApplicationService;
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

// Pure unit tests, no Spring context - TeamController is pure delegation to
// TeamApplicationService; these pin down argument order/pass-through per
// endpoint (already-real logic like category/team existence checks is
// covered at CommandHelperTeamTest instead).
@ExtendWith(MockitoExtension.class)
class TeamControllerTest {

    @Mock private TeamApplicationService teamApplicationService;

    private TeamController teamController;

    @BeforeEach
    void setUp() {
        teamController = new TeamController(teamApplicationService);
    }

    @Test
    void createNewTeam_delegatesTheCreateRecordAndReturnsTheResultDirectly() {
        TeamCreateRecord request = new TeamCreateRecord(null, "Los Tigres", UUID.randomUUID(), Set.of(), null);
        TeamDetailsRecord created = mock(TeamDetailsRecord.class);
        when(teamApplicationService.createNewTeam(request)).thenReturn(created);

        assertThat(teamController.createNewTeam(request)).isSameAs(created);
    }

    @Test
    void existTeam_delegatesDirectlyToTheService() {
        UUID teamId = UUID.randomUUID();
        when(teamApplicationService.existTeam(teamId)).thenReturn(true);

        assertThat(teamController.existTeam(teamId)).isTrue();
    }

    @Test
    void getTeamWithoutPlayers_delegatesTeamIdAndCategoryIdInThatOrder() {
        UUID teamId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        TeamDetailsRecord details = mock(TeamDetailsRecord.class);
        when(teamApplicationService.getTeamWithoutPlayers(teamId, categoryId)).thenReturn(details);

        assertThat(teamController.getTeamWithoutPlayers(teamId, categoryId)).isSameAs(details);
    }

    @Test
    void deleteTeamByCategory_delegatesCategoryIdAndTeamIdInThatOrder() {
        UUID categoryId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        teamController.deleteTeamByCategory(categoryId, teamId);

        verify(teamApplicationService).deleteTeamByCategory(categoryId, teamId);
    }

    @Test
    void getTeamsByPosition_returnsServiceResultUnchangedIncludingOrder() {
        UUID categoryId = UUID.randomUUID();
        List<TeamScore> standings = List.of(
                new TeamScore(UUID.randomUUID(), "First", 5, 1, 20, null),
                new TeamScore(UUID.randomUUID(), "Second", 3, 2, 10, null));
        when(teamApplicationService.getTeamsByPosition(categoryId)).thenReturn(standings);

        assertThat(teamController.getTeamsByPosition(categoryId)).isSameAs(standings);
    }

    @Test
    void updateTeamByCategoryWithLogoOrName_delegatesAllFourArgumentsInOrder() {
        UUID categoryId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        TeamDetailsRecord updated = mock(TeamDetailsRecord.class);
        when(teamApplicationService.updateTeamByCategoryWithLogoOrName(categoryId, teamId, "logo.png", "New Name"))
                .thenReturn(updated);

        TeamDetailsRecord result = teamController.updateTeamByCategoryWithLogoOrName(categoryId, teamId, "logo.png", "New Name");

        assertThat(result).isSameAs(updated);
    }
}
