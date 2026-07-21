package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.team.entitiy.*;
import com.soccer.fut7.soccer_system.team.repository.JourneyRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TeamRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.TournamentRepositoryData;
import com.soccer.fut7.soccer_system.team.repository.UserRepositoryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated. Only toEntity/toDomain are covered here
// (the two methods routed through BaseMapper's getMapper(...) lookup, same
// technique as TeamMapperTest/PlayerMapperTest) - convertToCustomMatchDetails
// and mapMatchesWithStats are raw-native-query row-unpacking helpers that
// need several more repository mocks each for comparatively low additional
// risk coverage, left for a future pass (see TESTING-STRATEGY.md).
//
// Found, not fixed (documented as current behavior): toDomain calls
// entity.getJourney().getJourneyNumber() with NO null-check on getJourney()
// itself (only on the journeyNumber inside it) - journey_id has no
// nullable=false at the JPA level, so a match with no journey assigned yet
// would NPE here. Flagged, not changed - this mapper alone can't tell
// whether "a match always has a journey by the time it's read back" is a
// real invariant enforced elsewhere or a live gap.
@ExtendWith(MockitoExtension.class)
class MatchMapperTest {

    @Mock private UserRepositoryData userRepository;
    @Mock private TeamRepositoryData teamRepository;
    @Mock private TournamentRepositoryData tournamentRepository;
    @Mock private JourneyRepositoryData journeyRepository;
    @Mock private ApplicationContext applicationContext;
    @Mock private CategoryMapper categoryMapper;
    @Mock private UserMapper userMapper;

    private MatchMapper matchMapper;

    @BeforeEach
    void setUp() {
        matchMapper = new MatchMapper(userRepository, teamRepository, tournamentRepository, journeyRepository);
        matchMapper.applicationContext = applicationContext;
        lenient().when(applicationContext.getBean(CategoryMapper.class)).thenReturn(categoryMapper);
        lenient().when(applicationContext.getBean(UserMapper.class)).thenReturn(userMapper);
    }

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(matchMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_delegatesCategoryAndRefereeThroughTheLookedUpMappers() {
        UUID categoryId = UUID.randomUUID();
        User referee = User.builder().id(UUID.randomUUID()).build();
        Match domain = Match.builder()
                .id(UUID.randomUUID())
                .categoryId(categoryId)
                .matchDate(new MatchDate(LocalDate.of(2026, 3, 1)))
                .status(MatchStatus.PENDIENTE)
                .referee(referee)
                .build();
        CategoryEntity categoryEntity = CategoryEntity.builder().build();
        UserEntity refereeEntity = UserEntity.builder().build();
        when(categoryMapper.UUIDtoEntity(categoryId)).thenReturn(categoryEntity);
        when(userMapper.toEntity(referee)).thenReturn(refereeEntity);

        MatchEntity result = matchMapper.toEntity(domain);

        assertThat(result.getCategory()).isSameAs(categoryEntity);
        assertThat(result.getReferee()).isSameAs(refereeEntity);
        assertThat(result.getMatchStatus()).isEqualTo("PENDIENTE");
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(matchMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_noJourneyAssigned_throwsNullPointerException() {
        MatchEntity entity = MatchEntity.builder()
                .id(UUID.randomUUID())
                .phase("ROUND_ROBIN")
                .journey(null)
                .build();

        assertThatThrownBy(() -> matchMapper.toDomain(entity)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void toDomain_refereeIsNull_doesNotCallTheUserMapperAndLeavesRefereeNull() {
        MatchEntity entity = buildFullMatchEntity("ROUND_ROBIN", 3);
        entity.setReferee(null);

        Match result = matchMapper.toDomain(entity);

        assertThat(result.getReferee()).isNull();
        verifyNoInteractions(userMapper);
    }

    @Test
    void toDomain_roundRobinPhase_formatsAsJornadaPlusJourneyNumber() {
        MatchEntity entity = buildFullMatchEntity("ROUND_ROBIN", 5);
        entity.setReferee(null);

        assertThat(matchMapper.toDomain(entity).getPhase()).isEqualTo("JORNADA-5");
    }

    @Test
    void toDomain_nonRoundRobinPhase_passesThroughUnchanged() {
        MatchEntity entity = buildFullMatchEntity("FINAL", 1);
        entity.setReferee(null);

        assertThat(matchMapper.toDomain(entity).getPhase()).isEqualTo("FINAL");
    }

    @Test
    void toDomain_journeyNumberIsNull_defaultsToZeroInsteadOfStayingNull() {
        MatchEntity entity = buildFullMatchEntity("FINAL", null);
        entity.setReferee(null);

        assertThat(matchMapper.toDomain(entity).getNumberJourney()).isZero();
    }

    private MatchEntity buildFullMatchEntity(String phase, Integer journeyNumber) {
        TeamEntity homeTeam = TeamEntity.builder()
                .category(CategoryEntity.builder().id(UUID.randomUUID()).build())
                .build();
        return MatchEntity.builder()
                .id(UUID.randomUUID())
                .phase(phase)
                .matchDate(LocalDate.of(2026, 3, 1))
                .matchStatus("PENDIENTE")
                .journey(JourneyEntity.builder().journeyNumber(journeyNumber).build())
                .tournament(TournamentEntity.builder().id(UUID.randomUUID()).build())
                .homeTeam(homeTeam)
                .build();
    }
}
