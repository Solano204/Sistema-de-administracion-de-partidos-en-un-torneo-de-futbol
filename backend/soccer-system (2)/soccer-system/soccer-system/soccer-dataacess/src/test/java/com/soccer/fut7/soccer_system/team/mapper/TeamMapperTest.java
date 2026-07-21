package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ValueObject.TeamLogo;
import com.soccer.fut7.soccer_system.ValueObject.TeamName;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. TeamMapper extends BaseMapper, which
// looks up its CategoryMapper/PlayerMapper collaborators lazily via a
// Spring ApplicationContext (getMapper(...)) rather than constructor
// injection - this test class lives in the SAME package as TeamMapper
// specifically so it can set that protected `applicationContext` field
// directly (package-private/protected access, no reflection needed) and
// stub getBean(...) instead of standing up a real Spring context.
//
// Two real, previously-undiscovered issues found while writing this:
// 1. toEntityWithPlayers has no null-safety on domain.getName()/getLogo()
//    (toEntity, its sibling method, DOES null-check both) - an NPE risk if
//    ever called with an incompletely-built Team.
// 2. toTeamStats wraps entity.getId() in `new TeamStatsId(...)`, whose
//    compact constructor throws IllegalArgumentException on a null value -
//    so mapping a not-yet-persisted TeamStatsEntity (no generated id yet)
//    would throw. Both are documented as tests pinning down the CURRENT
//    behavior, not silently "fixed" - that's a product/design call.
@ExtendWith(MockitoExtension.class)
class TeamMapperTest {

    @Mock private PlayerMapper playerMapper;
    @Mock private CategoryMapper categoryMapper;
    @Mock private ApplicationContext applicationContext;

    private TeamMapper teamMapper;

    @BeforeEach
    void setUp() {
        teamMapper = new TeamMapper(playerMapper);
        teamMapper.applicationContext = applicationContext;
        lenient().when(applicationContext.getBean(CategoryMapper.class)).thenReturn(categoryMapper);
        lenient().when(applicationContext.getBean(PlayerMapper.class)).thenReturn(playerMapper);
    }

    // ── toEntity: null-safe on every optional field ────────────────────────

    @Test
    void toEntity_domainIsNull_returnsNullWithoutTouchingTheApplicationContext() {
        assertThat(teamMapper.toEntity(null)).isNull();
        verifyNoInteractions(applicationContext);
    }

    @Test
    void toEntity_nameLogoAndCategoryAllNull_mapsWithoutThrowing() {
        Team domain = Team.builder().id(UUID.randomUUID()).build();

        TeamEntity result = teamMapper.toEntity(domain);

        assertThat(result.getTeamName()).isNull();
        assertThat(result.getLogoUrl()).isNull();
        assertThat(result.getCategory()).isNull();
        assertThat(result.getActive()).isFalse(); // domain.getActive() null -> defaults false, not null
    }

    @Test
    void toEntity_allFieldsPresent_mapsEveryFieldAndDelegatesCategoryThroughTheLookedUpMapper() {
        UUID id = UUID.randomUUID();
        Category category = Category.builder().id(UUID.randomUUID()).build();
        CategoryEntity categoryEntity = CategoryEntity.builder().build();
        Team domain = Team.builder()
                .id(id)
                .name(new TeamName("Los Tigres"))
                .logo(new TeamLogo("logo.png"))
                .category(category)
                .active(true)
                .numberOfPlayers(11)
                .build();
        when(categoryMapper.toEntity(category)).thenReturn(categoryEntity);

        TeamEntity result = teamMapper.toEntity(domain);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getTeamName()).isEqualTo("Los Tigres");
        assertThat(result.getLogoUrl()).isEqualTo("logo.png");
        assertThat(result.getCategory()).isSameAs(categoryEntity);
        assertThat(result.getActive()).isTrue();
        assertThat(result.getNumberOfPlayers()).isEqualTo(11);
    }

    // ── toEntityWithPlayers: the NOT-null-safe sibling method ──────────────

    @Test
    void toEntityWithPlayers_nameIsNull_throwsNullPointerExceptionUnlikeToEntity() {
        Team domain = Team.builder().id(UUID.randomUUID()).category(Category.builder().build()).build();

        assertThatThrownBy(() -> teamMapper.toEntityWithPlayers(domain))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void toEntityWithPlayers_allFieldsPresent_delegatesPlayersThroughThePlayerMapperConstructorField() {
        Category category = Category.builder().id(UUID.randomUUID()).build();
        Set<Player> players = Set.of(Player.builder().id(UUID.randomUUID()).build());
        Team domain = Team.builder()
                .id(UUID.randomUUID())
                .name(new TeamName("Los Tigres"))
                .logo(new TeamLogo("logo.png"))
                .category(category)
                .numberOfPlayers(1)
                .players(players)
                .build();
        when(categoryMapper.toEntity(category)).thenReturn(CategoryEntity.builder().build());
        when(playerMapper.toEntity(players)).thenReturn(Set.of());

        teamMapper.toEntityWithPlayers(domain);

        verify(playerMapper).toEntity(players);
    }

    // ── UUIDtoEntity ────────────────────────────────────────────────────────

    @Test
    void uuidToEntity_buildsAShellEntityWithOnlyTheIdSet() {
        UUID id = UUID.randomUUID();

        TeamEntity result = teamMapper.UUIDtoEntity(id);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getTeamName()).isNull();
    }

    // ── toDomain ────────────────────────────────────────────────────────────

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(teamMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_noPlayers_neverCallsThePlayerMapper() {
        TeamEntity entity = TeamEntity.builder()
                .id(UUID.randomUUID())
                .teamName("Los Tigres")
                .logoUrl("logo.png")
                .players(Set.of())
                .build();
        when(categoryMapper.toDomain(null)).thenReturn(null);

        Team result = teamMapper.toDomain(entity);

        assertThat(result.getPlayers()).isNull();
        verifyNoInteractions(playerMapper);
    }

    @Test
    void toDomain_hasPlayers_buildsALightweightTeamReferenceForThePlayerMapper() {
        UUID teamId = UUID.randomUUID();
        var playerEntity = com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity.builder().build();
        TeamEntity entity = TeamEntity.builder()
                .id(teamId)
                .teamName("Los Tigres")
                .logoUrl("logo.png")
                .players(Set.of(playerEntity))
                .build();
        when(categoryMapper.toDomain(null)).thenReturn(null);
        when(playerMapper.toDomainWithStats(eq(Set.of(playerEntity)), any(Team.class))).thenReturn(Set.of());

        teamMapper.toDomain(entity);

        verify(playerMapper).toDomainWithStats(eq(Set.of(playerEntity)), argThat(teamRef ->
                teamRef.getId().equals(teamId) && teamRef.getName().value().equals("Los Tigres")));
    }

    // ── toTeamStats ─────────────────────────────────────────────────────────

    @Test
    void toTeamStats_entityIsNull_returnsNull() {
        assertThat(teamMapper.toTeamStats(null)).isNull();
    }

    @Test
    void toTeamStats_entityHasNoGeneratedIdYet_throwsIllegalArgumentException() {
        TeamStatsEntity entity = TeamStatsEntity.builder().build(); // id is null - not yet persisted

        assertThatThrownBy(() -> teamMapper.toTeamStats(entity))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void toTeamStats_allNullableCountersNull_defaultToZeroOrFalseNotNull() {
        TeamStatsEntity entity = TeamStatsEntity.builder()
                .id(UUID.randomUUID())
                .goals(null).goalsAgainst(null).matchesPlayed(null)
                .matchesWon(null).matchesDrawn(null).matchesLost(null)
                .points(null).qualifiedNextRound(null)
                .build();

        TeamStats result = teamMapper.toTeamStats(entity);

        assertThat(result.getGoalsWin()).isZero();
        assertThat(result.getGoalsAgainst()).isZero();
        assertThat(result.getMatchesPlayed()).isZero();
        assertThat(result.getPoints()).isZero();
        assertThat(result.isQualified()).isFalse();
    }

    @Test
    void toTeamStats_valuesPresent_carriesThemThroughUnchanged() {
        TeamStatsEntity entity = TeamStatsEntity.builder()
                .id(UUID.randomUUID())
                .goals(10).goalsAgainst(4).matchesPlayed(6)
                .matchesWon(3).matchesDrawn(2).matchesLost(1)
                .points(11).qualifiedNextRound(true)
                .build();

        TeamStats result = teamMapper.toTeamStats(entity);

        assertThat(result.getGoalsWin()).isEqualTo(10);
        assertThat(result.getGoalsAgainst()).isEqualTo(4);
        assertThat(result.getPoints()).isEqualTo(11);
        assertThat(result.isQualified()).isTrue();
    }
}
