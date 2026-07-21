package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.tourment.TourmentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.entitiy.TournamentEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Pure unit tests. toEntity has two behaviors worth pinning down explicitly:
//
// 1. If domain.getId() is null, a NEW random UUID is generated on the spot
//    rather than leaving it to the database's own @GeneratedValue - meaning
//    calling toEntity twice for the "same" not-yet-persisted tournament
//    produces two different ids.
// 2. currentPhase/status are HARDCODED to "ROUND_ROBIN"/"ACTIVO" regardless
//    of what's actually in the domain object - so toEntity is only safe to
//    use for the initial-creation flow; calling it on a domain object
//    representing an already-in-progress tournament would silently reset
//    its phase/status back to the initial values. Documented, not changed -
//    this mapper alone can't confirm every call site only ever uses it for
//    fresh tournaments.
@ExtendWith(MockitoExtension.class)
class TournamentMapperTest {

    @Mock private CategoryMapper categoryMapper;

    private TournamentMapper tournamentMapper;

    @BeforeEach
    void setUp() {
        tournamentMapper = new TournamentMapper(categoryMapper);
    }

    @Test
    void toEntity_domainIdIsNull_generatesARandomIdInstead() {
        TourmentEntity domain = new TourmentEntity();
        domain.setCategoryName("Sub-17");

        TournamentEntity result = tournamentMapper.toEntity(domain);

        assertThat(result.getId()).isNotNull();
    }

    @Test
    void toEntity_domainIdIsPresent_isCarriedThroughUnchanged() {
        UUID id = UUID.randomUUID();
        TourmentEntity domain = new TourmentEntity();
        domain.setId(id);
        domain.setCategoryName("Sub-17");

        assertThat(tournamentMapper.toEntity(domain).getId()).isEqualTo(id);
    }

    @Test
    void toEntity_alwaysResetsPhaseAndStatusToInitialValuesRegardlessOfDomainState() {
        TourmentEntity domain = new TourmentEntity();
        domain.setId(UUID.randomUUID());
        domain.setCategoryName("Sub-17");
        domain.setPhase("SEMIFINAL"); // an in-progress tournament's real phase

        TournamentEntity result = tournamentMapper.toEntity(domain);

        assertThat(result.getCurrentPhase()).isEqualTo("ROUND_ROBIN");
        assertThat(result.getStatus()).isEqualTo("ACTIVO");
    }

    @Test
    void toDomain_mapsCategoryNameFromTheNestedCategoryEntity() {
        TournamentEntity entity = TournamentEntity.builder()
                .id(UUID.randomUUID())
                .tournamentName("Copa Verano")
                .currentPhase("ROUND_ROBIN")
                .category(CategoryEntity.builder().categoryName("Sub-17").build())
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 6, 1))
                .build();

        TourmentEntity result = tournamentMapper.toDomain(entity);

        assertThat(result.getCategoryName()).isEqualTo("Sub-17");
        assertThat(result.getPhase()).isEqualTo("ROUND_ROBIN");
        assertThat(result.getTournamentName()).isEqualTo("Copa Verano");
    }
}
