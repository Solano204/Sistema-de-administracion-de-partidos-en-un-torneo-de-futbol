package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.ValueObject.Cards;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.JerseyNumber;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerStatsEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Pure unit tests. Note: unlike TeamStatsMapper (which references the
// parent team via a bare UUIDtoEntity shell), toEntity here delegates the
// player reference through PlayerMapper's FULL toEntity(Player) mapping,
// not a shell reference - an asymmetric pattern between the two otherwise
// structurally similar *StatsMapper classes, pinned down as current
// behavior below rather than assumed to be a copy-paste inconsistency.
@ExtendWith(MockitoExtension.class)
class PlayerStatsMapperTest {

    @Mock private PlayerMapper playerMapper;

    private PlayerStatsMapper playerStatsMapper;

    @BeforeEach
    void setUp() {
        playerStatsMapper = new PlayerStatsMapper(playerMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(playerStatsMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_delegatesThePlayerReferenceThroughTheFullPlayerMapperToEntity() {
        Player domain = Player.builder()
                .id(UUID.randomUUID())
                .goals(Goals.of(5))
                .points(Points.of(10))
                .jerseyNumber(new JerseyNumber(7))
                .cards(Cards.of(2, 1))
                .build();
        PlayerEntity fullPlayerEntity = PlayerEntity.builder().id(domain.getId()).build();
        when(playerMapper.toEntity(domain)).thenReturn(fullPlayerEntity);

        PlayerStatsEntity result = playerStatsMapper.toEntity(domain);

        assertThat(result.getPlayer()).isSameAs(fullPlayerEntity);
        assertThat(result.getGoals()).isEqualTo(5);
        assertThat(result.getYellowCards()).isEqualTo(2);
        assertThat(result.getRedCards()).isEqualTo(1);
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(playerStatsMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_mapsStatsFieldsOnlyLeavesPersonalFieldsUnset() {
        // Documents current behavior: this method builds a Player from ONLY
        // the stats fields - personName/team/etc. are never set, unlike
        // PlayerMapper.toDomain which maps the full entity.
        PlayerStatsEntity entity = PlayerStatsEntity.builder()
                .id(UUID.randomUUID())
                .goals(5).points(10).jerseyNumber(7).yellowCards(2).redCards(1)
                .build();

        Player result = playerStatsMapper.toDomain(entity);

        assertThat(result.getGoals().value()).isEqualTo(5);
        assertThat(result.getJerseyNumber().value()).isEqualTo(7);
        assertThat(result.getPersonName()).isNull();
        assertThat(result.getTeam()).isNull();
    }
}
