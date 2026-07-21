package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.team.dto.projection.PlayerWithTeamAndStatsProjection;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Pure unit tests, Mockito-isolated. Same same-package-protected-field
// approach as TeamMapperTest for BaseMapper's ApplicationContext lookup.
//
// Found and fixed a real, previously-undiscovered data-loss bug while
// writing this: toEntity's playerStatus handling was
//   if (domain.getPlayerStatus() == null) { builder.playerStatus(ACTIVO) }
// with NO corresponding branch for the non-null case - so any player with
// an explicit, non-default status (e.g. LESIONADO/INACTIVO) had that status
// silently DROPPED every time they were persisted, always ending up
// re-saved as whatever the builder's default was instead. Every other field
// in this same method follows the correct "if (x != null) { copy x }"
// shape; this one branch was inverted with no else. Fixed by adding the
// missing branch. playerStatusIsSet_isCarriedThroughNotDropped below is the
// direct regression test for this fix.
@ExtendWith(MockitoExtension.class)
class PlayerMapperTest {

    @Mock private ApplicationContext applicationContext;
    @Mock private TeamMapper teamMapper;

    private PlayerMapper playerMapper;

    @BeforeEach
    void setUp() {
        playerMapper = new PlayerMapper();
        playerMapper.applicationContext = applicationContext;
        lenient().when(applicationContext.getBean(TeamMapper.class)).thenReturn(teamMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(playerMapper.toEntity((Player) null)).isNull();
    }

    // ── the fixed bug ────────────────────────────────────────────────────

    @Test
    void toEntity_playerStatusIsSet_isCarriedThroughNotDropped() {
        Player domain = Player.builder().id(UUID.randomUUID()).playerStatus(PlayerStatus.LESIONADO).build();

        PlayerEntity result = playerMapper.toEntity(domain);

        assertThat(result.getPlayerStatus()).isEqualTo("LESIONADO");
    }

    @Test
    void toEntity_playerStatusIsNull_defaultsToActivo() {
        Player domain = Player.builder().id(UUID.randomUUID()).build();

        PlayerEntity result = playerMapper.toEntity(domain);

        assertThat(result.getPlayerStatus()).isEqualTo("ACTIVO");
    }

    // ── null-safety on the optional fields ──────────────────────────────

    @Test
    void toEntity_photoIsEmptyString_treatedAsAbsentNotSetOnTheEntity() {
        Player domain = Player.builder().id(UUID.randomUUID()).photo("").build();

        PlayerEntity result = playerMapper.toEntity(domain);

        assertThat(result.getPhotoUrl()).isNull();
    }

    @Test
    void toEntity_personNameSet_splitsIntoFirstAndLastNameFields() {
        Player domain = Player.builder().id(UUID.randomUUID()).personName(new PersonName("Carlos", "Perez")).build();

        PlayerEntity result = playerMapper.toEntity(domain);

        assertThat(result.getFirstName()).isEqualTo("Carlos");
        assertThat(result.getLastName()).isEqualTo("Perez");
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(playerMapper.toDomain((PlayerEntity) null)).isNull();
    }

    @Test
    void toDomain_onlyFirstNameSetNoLastName_personNameStaysUnset() {
        // Documents current behavior: the && requires BOTH first and last
        // name present, so a partially-populated name is silently dropped
        // entirely rather than partially carried through.
        PlayerEntity entity = PlayerEntity.builder().id(UUID.randomUUID()).firstName("Carlos").lastName(null).build();

        Player result = playerMapper.toDomain(entity);

        assertThat(result.getPersonName()).isNull();
    }

    @Test
    void toDomain_playerStatusEmptyString_treatedAsAbsentDefaultsToNull() {
        PlayerEntity entity = PlayerEntity.builder().id(UUID.randomUUID()).playerStatus("").build();

        Player result = playerMapper.toDomain(entity);

        assertThat(result.getPlayerStatus()).isNull();
    }

    // ── toDomainWithStats: the one method that also maps PlayerStatsEntity ─

    @Test
    void toDomainWithStats_playerStatsPresent_mapsGoalsPointsAndCards() {
        PlayerStatsEntity stats = PlayerStatsEntity.builder().goals(5).points(3).yellowCards(2).redCards(1).build();
        PlayerEntity entity = PlayerEntity.builder().id(UUID.randomUUID()).playerStats(stats).build();
        Team team = Team.builder().id(UUID.randomUUID()).build();

        Set<Player> result = playerMapper.toDomainWithStats(Set.of(entity), team);

        Player mapped = result.iterator().next();
        assertThat(mapped.getGoals().value()).isEqualTo(5);
        assertThat(mapped.getPoints().value()).isEqualTo(3);
        assertThat(mapped.getCards().yellowCards()).isEqualTo(2);
        assertThat(mapped.getCards().redCards()).isEqualTo(1);
        assertThat(mapped.getTeam()).isSameAs(team);
    }

    @Test
    void toDomainWithStats_playerStatsAbsent_leavesGoalsPointsCardsNull() {
        PlayerEntity entity = PlayerEntity.builder().id(UUID.randomUUID()).playerStats(null).build();
        Team team = Team.builder().id(UUID.randomUUID()).build();

        Player result = playerMapper.toDomainWithStats(Set.of(entity), team).iterator().next();

        assertThat(result.getGoals()).isNull();
        assertThat(result.getPoints()).isNull();
        assertThat(result.getCards()).isNull();
    }

    @Test
    void toDomainWithStats_nullEntitiesSet_returnsNull() {
        assertThat(playerMapper.toDomainWithStats(null, Team.builder().build())).isNull();
    }

    // ── projectionToEntity: builds a bidirectional PlayerEntity<->PlayerStatsEntity link ─

    @Test
    void projectionToEntity_setsUpTheBidirectionalPlayerStatsRelationship() {
        PlayerWithTeamAndStatsProjection projection = mock(PlayerWithTeamAndStatsProjection.class);
        UUID playerId = UUID.randomUUID();
        when(projection.getPlayerId()).thenReturn(playerId);
        when(projection.getPlayerStatsGoals()).thenReturn(null);
        when(projection.getPlayerStatsPoints()).thenReturn(null);
        when(projection.getPlayerStatsYellowCards()).thenReturn(null);
        when(projection.getPlayerStatsRedCards()).thenReturn(null);
        when(projection.getTeamId()).thenReturn(UUID.randomUUID());

        PlayerEntity result = playerMapper.projectionToEntity(projection);

        assertThat(result.getId()).isEqualTo(playerId);
        assertThat(result.getPlayerStats().getPlayer()).isSameAs(result);
        // Null stats counters default to 0, not null - matches every other
        // nullable-Integer default pattern in this mapper.
        assertThat(result.getPlayerStats().getGoals()).isZero();
    }

    @Test
    void projectionToEntity_nullProjection_returnsNull() {
        assertThat(playerMapper.projectionToEntity(null)).isNull();
    }
}
