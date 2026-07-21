package com.soccer.fut7.soccer_system.ValueObject;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests. This compact constructor's null-check is exactly what
// makes TeamMapper.toTeamStats/TeamStatsMapper.toDomain throw
// IllegalArgumentException when mapping a not-yet-persisted
// TeamStatsEntity (see TeamMapperTest/TeamStatsMapperTest) - tested here in
// isolation as the actual source of that behavior.
class TeamStatsIdTest {

    @Test
    void constructor_nullValue_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> new TeamStatsId(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null");
    }

    @Test
    void constructor_validUuid_isAccepted() {
        UUID id = UUID.randomUUID();

        assertThat(new TeamStatsId(id).value()).isEqualTo(id);
    }

    @Test
    void generateNew_producesADifferentIdEachTime() {
        assertThat(TeamStatsId.generateNew()).isNotEqualTo(TeamStatsId.generateNew());
    }
}
