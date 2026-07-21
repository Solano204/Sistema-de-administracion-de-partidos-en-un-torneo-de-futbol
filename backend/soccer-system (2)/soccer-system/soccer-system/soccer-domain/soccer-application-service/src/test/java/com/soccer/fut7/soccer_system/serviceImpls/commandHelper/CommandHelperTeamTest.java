package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ExceptionApplication.categoryException;
import com.soccer.fut7.soccer_system.ExceptionApplication.teamException;
import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;
import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.mappers.EntityDtoMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CategoryRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - CommandHelperTeam is one of the few
// CommandHelper classes with real orchestration logic (existence checks
// before delegating, a sort, a non-throwing existence check that differs
// from the rest of the class's throw-on-empty pattern), unlike most of its
// sibling CommandHelper classes which are pure repository+mapper delegation.
@ExtendWith(MockitoExtension.class)
class CommandHelperTeamTest {

    @Mock private EntityDtoMapperDomain mapper;
    @Mock private TeamRepository teamRepository;
    @Mock private CategoryRepository categoryRepository;

    private CommandHelperTeam commandHelperTeam;

    @BeforeEach
    void setUp() {
        commandHelperTeam = new CommandHelperTeam(mapper, teamRepository, categoryRepository);
    }

    private Category buildCategory(UUID id) {
        return Category.builder().id(id).name(new CategoryName("Sub-17")).ageRange(new AgeRange(15, 17)).build();
    }

    // ── createNewTeam: validates the category exists before creating ──────

    @Test
    void createNewTeam_categoryDoesNotExist_throwsCategoryExceptionAndNeverCallsRepository() {
        UUID categoryId = UUID.randomUUID();
        TeamCreateRecord newTeam = new TeamCreateRecord(null, "Los Tigres", categoryId, Set.of(), "logo.png");
        when(categoryRepository.existCategory(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperTeam.createNewTeam(newTeam))
                .isInstanceOf(categoryException.class);
        verifyNoInteractions(teamRepository);
    }

    @Test
    void createNewTeam_categoryExistsButRepositoryFailsToCreate_throwsTeamException() {
        UUID categoryId = UUID.randomUUID();
        Category category = buildCategory(categoryId);
        TeamCreateRecord newTeam = new TeamCreateRecord(null, "Los Tigres", categoryId, Set.of(), "logo.png");
        when(categoryRepository.existCategory(categoryId)).thenReturn(Optional.of(category));
        when(mapper.teamCreateRecordToTeam(newTeam)).thenReturn(Team.builder().build());
        when(teamRepository.createTeam(any(Team.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperTeam.createNewTeam(newTeam))
                .isInstanceOf(teamException.class);
    }

    @Test
    void createNewTeam_categoryExistsAndRepositorySucceeds_returnsCreatedTeam() {
        UUID categoryId = UUID.randomUUID();
        Category category = buildCategory(categoryId);
        TeamCreateRecord newTeam = new TeamCreateRecord(null, "Los Tigres", categoryId, Set.of(), "logo.png");
        Team createdTeam = Team.builder().id(UUID.randomUUID()).build();
        when(categoryRepository.existCategory(categoryId)).thenReturn(Optional.of(category));
        when(mapper.teamCreateRecordToTeam(newTeam)).thenReturn(Team.builder().build());
        when(teamRepository.createTeam(any(Team.class))).thenReturn(Optional.of(createdTeam));

        Team result = commandHelperTeam.createNewTeam(newTeam);

        assertThat(result).isSameAs(createdTeam);
    }

    // ── getTeamsNameIdByCategory: existence-checked before the real fetch ──

    @Test
    void getTeamsNameIdByCategory_teamDoesNotExist_throwsTeamExceptionAndNeverCallsGetTeam() {
        UUID categoryId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperTeam.getTeamsNameIdByCategory(categoryId, teamId))
                .isInstanceOf(teamException.class);
        verify(teamRepository, never()).getTeam(any());
    }

    @Test
    void getTeamsNameIdByCategory_teamExists_returnsTeamFromRepository() {
        UUID categoryId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        Team team = Team.builder().id(teamId).build();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.of(true));
        when(teamRepository.getTeam(teamId)).thenReturn(Optional.of(team));

        Team result = commandHelperTeam.getTeamsNameIdByCategory(categoryId, teamId);

        assertThat(result).isSameAs(team);
    }

    // ── existTeam: the one method in this class that does NOT throw on ────
    // absence - deliberately returns false via orElse(false) instead, unlike
    // every other lookup method here which throws teamException. Pinning
    // this distinction down so a future "make it consistent" refactor is a
    // deliberate choice, not an accidental behavior change.

    @Test
    void existTeam_repositoryReturnsEmpty_returnsFalseInsteadOfThrowing() {
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.empty());

        assertThat(commandHelperTeam.existTeam(teamId)).isFalse();
    }

    @Test
    void existTeam_repositoryReturnsTrue_returnsTrue() {
        UUID teamId = UUID.randomUUID();
        when(teamRepository.existTeam(teamId)).thenReturn(Optional.of(true));

        assertThat(commandHelperTeam.existTeam(teamId)).isTrue();
    }

    // ── getTeamsByPosition: the one real algorithm in this class - must ────
    // sort strictly by points, descending, regardless of repository order.

    @Test
    void getTeamsByPosition_unsortedRepositoryResult_returnsDescendingByPoints() {
        UUID categoryId = UUID.randomUUID();
        UUID lowId = UUID.randomUUID();
        UUID midId = UUID.randomUUID();
        UUID highId = UUID.randomUUID();
        TeamStats low = TeamStats.builder().idTeam(lowId).points(3).build();
        TeamStats mid = TeamStats.builder().idTeam(midId).points(10).build();
        TeamStats high = TeamStats.builder().idTeam(highId).points(20).build();
        // Deliberately fed in ascending order - the repository makes no ordering
        // guarantee, so the sort must not just happen to match input order.
        when(teamRepository.getTeamsByPosition(categoryId)).thenReturn(Optional.of(Set.of(low, mid, high)));
        when(mapper.teamStatsToTeamScore(low)).thenReturn(new TeamScore(lowId, "Low", 0, 0, 3, null));
        when(mapper.teamStatsToTeamScore(mid)).thenReturn(new TeamScore(midId, "Mid", 0, 0, 10, null));
        when(mapper.teamStatsToTeamScore(high)).thenReturn(new TeamScore(highId, "High", 0, 0, 20, null));

        List<TeamScore> result = commandHelperTeam.getTeamsByPosition(categoryId);

        assertThat(result).extracting(TeamScore::points).containsExactly(20, 10, 3);
    }

    @Test
    void getTeamsByPosition_repositoryReturnsEmpty_throwsTeamException() {
        UUID categoryId = UUID.randomUUID();
        when(teamRepository.getTeamsByPosition(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperTeam.getTeamsByPosition(categoryId))
                .isInstanceOf(teamException.class);
    }

    @Test
    void deleteTeamByCategory_delegatesDirectlyToRepository() {
        UUID categoryId = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();

        commandHelperTeam.deleteTeamByCategory(categoryId, teamId);

        verify(teamRepository).deleteTeamByCategory(categoryId, teamId);
    }
}
