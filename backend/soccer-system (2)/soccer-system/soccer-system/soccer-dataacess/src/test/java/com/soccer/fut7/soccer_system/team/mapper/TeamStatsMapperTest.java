package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.ValueObject.TeamStatsId;
import com.soccer.fut7.soccer_system.team.entitiy.TeamEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TeamStatsEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

// Pure unit tests. Note there are TWO independent TeamStatsEntity<->TeamStats
// converters in this codebase - this standalone class, and
// TeamMapper.toTeamStats (see TeamMapperTest) - not consolidated here, just
// flagged as a duplication worth knowing about; behavior of each is tested
// on its own terms since a caller could reach either one.
@ExtendWith(MockitoExtension.class)
class TeamStatsMapperTest {

    @Mock private TeamMapper teamMapper;

    private TeamStatsMapper teamStatsMapper;

    @BeforeEach
    void setUp() {
        teamStatsMapper = new TeamStatsMapper(teamMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(teamStatsMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_delegatesTeamReferenceThroughUUIDtoEntityNotAFullMapping() {
        UUID teamId = UUID.randomUUID();
        TeamStats domain = TeamStats.builder()
                .id(TeamStatsId.generateNew())
                .idTeam(teamId)
                .matchesPlayed(10).goalsWin(20).goalsAgainst(5).points(25)
                .build();
        TeamEntity shellTeam = TeamEntity.builder().id(teamId).build();
        when(teamMapper.UUIDtoEntity(teamId)).thenReturn(shellTeam);

        TeamStatsEntity result = teamStatsMapper.toEntity(domain);

        assertThat(result.getTeam()).isSameAs(shellTeam);
        assertThat(result.getPoints()).isEqualTo(25);
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(teamStatsMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_entityHasNoGeneratedIdYet_throwsIllegalArgumentException() {
        // Same TeamStatsId compact-constructor throw as TeamMapper.toTeamStats.
        TeamStatsEntity entity = TeamStatsEntity.builder().team(TeamEntity.builder().id(UUID.randomUUID()).build()).build();

        assertThatThrownBy(() -> teamStatsMapper.toDomain(entity)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void toDomain_allFieldsPresent_mapsTeamNameAndLogoFromTheNestedTeamEntity() {
        TeamEntity team = TeamEntity.builder().id(UUID.randomUUID()).teamName("Los Tigres").logoUrl("logo.png").build();
        TeamStatsEntity entity = TeamStatsEntity.builder()
                .id(UUID.randomUUID())
                .team(team)
                .matchesPlayed(10).goals(20).goalsAgainst(5).points(25)
                .build();

        TeamStats result = teamStatsMapper.toDomain(entity);

        assertThat(result.getNameTeam()).isEqualTo("Los Tigres");
        assertThat(result.getIdTeam()).isEqualTo(team.getId());
        assertThat(result.getGoalsWin()).isEqualTo(20);
    }
}
