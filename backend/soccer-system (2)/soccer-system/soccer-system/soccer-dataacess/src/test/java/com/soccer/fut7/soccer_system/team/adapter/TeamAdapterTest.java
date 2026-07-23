package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.helpers.TeamCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.TeamMapper;
import com.soccer.fut7.soccer_system.team.mapper.TeamStatsMapper;
import com.soccer.fut7.soccer_system.team.repository.CategoryRepositoryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests. Note: TeamMapper is injected TWICE (teamMapper_1,
// teamMapper) - teamMapper_1 is used only by getTeamsByName, teamMapper for
// everything else. Both resolve to the same singleton Spring bean at
// runtime, so this isn't a functional bug, just redundant/confusing wiring
// - flagged, not consolidated (a refactor, not this pass's job).
@ExtendWith(MockitoExtension.class)
class TeamAdapterTest {

    @Mock private TeamMapper teamMapper;
    @Mock private TeamCommandHelperRepository teamCommandHelperRepository;
    @Mock private CategoryRepositoryData categoryRepositoryData;
    @Mock private TeamStatsMapper teamStatsMapper;

    private TeamAdapter teamAdapter;

    @BeforeEach
    void setUp() {
        teamAdapter = new TeamAdapter(teamMapper, teamCommandHelperRepository, teamMapper, categoryRepositoryData, teamStatsMapper);
    }

    @Test
    void createTeam_categoryDoesNotExist_returnsEmptyOptionalWithoutCallingTheCommandHelper() {
        UUID categoryId = UUID.randomUUID();
        Team team = Team.builder().category(Category.builder().id(categoryId).build()).build();
        when(categoryRepositoryData.findById(categoryId)).thenReturn(Optional.empty());

        assertThat(teamAdapter.createTeam(team)).isEmpty();
        verifyNoInteractions(teamCommandHelperRepository);
    }

    @Test
    void createTeam_categoryExists_attachesTheRealCategoryEntityBeforeCreating() {
        UUID categoryId = UUID.randomUUID();
        Team team = Team.builder().category(Category.builder().id(categoryId).build()).build();
        CategoryEntity categoryEntity = CategoryEntity.builder().id(categoryId).build();
        TeamEntity mappedTeam = TeamEntity.builder().build();
        TeamEntity created = TeamEntity.builder().id(UUID.randomUUID()).build();
        Team mappedBack = Team.builder().id(created.getId()).build();
        when(categoryRepositoryData.findById(categoryId)).thenReturn(Optional.of(categoryEntity));
        when(teamMapper.toEntityWithPlayers(team)).thenReturn(mappedTeam);
        when(teamCommandHelperRepository.createTeamWithPlayers(mappedTeam)).thenReturn(created);
        when(teamMapper.toDomain(created)).thenReturn(mappedBack);

        Optional<Team> result = teamAdapter.createTeam(team);

        assertThat(mappedTeam.getCategory()).isSameAs(categoryEntity);
        assertThat(result).contains(mappedBack);
    }

    @Test
    void updateTeamByCategory_categoryDoesNotExist_throwsIllegalArgumentException() {
        UUID categoryId = UUID.randomUUID();
        when(categoryRepositoryData.findById(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamAdapter.updateTeamByCategory(categoryId, UUID.randomUUID(), Team.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(categoryId.toString());
    }
}
