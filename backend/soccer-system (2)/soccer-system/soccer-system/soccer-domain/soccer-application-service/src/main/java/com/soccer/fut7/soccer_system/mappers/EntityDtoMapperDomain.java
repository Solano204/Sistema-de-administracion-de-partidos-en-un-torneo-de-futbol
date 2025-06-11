package com.soccer.fut7.soccer_system.mappers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails;
import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.EntityApplication.Player;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerDebt;
import com.soccer.fut7.soccer_system.EntityApplication.PlayerMatchStats;
import com.soccer.fut7.soccer_system.EntityApplication.Team;
import com.soccer.fut7.soccer_system.EntityApplication.TeamStats;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.EntityApplication.CustomMatchDetails.InnerCustomMatchDetails;
import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.Cards;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;
import com.soccer.fut7.soccer_system.ValueObject.DebtDate;
import com.soccer.fut7.soccer_system.ValueObject.Email;
import com.soccer.fut7.soccer_system.ValueObject.Goals;
import com.soccer.fut7.soccer_system.ValueObject.InfoTeamMatch;
import com.soccer.fut7.soccer_system.ValueObject.JerseyNumber;
import com.soccer.fut7.soccer_system.ValueObject.MatchDate;
import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.PlayerStatus;
import com.soccer.fut7.soccer_system.ValueObject.Points;
import com.soccer.fut7.soccer_system.ValueObject.TeamLogo;
import com.soccer.fut7.soccer_system.ValueObject.TeamName;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.dto.common.PlayerDetailsDTO;
import com.soccer.fut7.soccer_system.dto.common.PlayerStatsDTO;
import com.soccer.fut7.soccer_system.dto.match.MatchCreateRecord;
import com.soccer.fut7.soccer_system.dto.match.MatchDetailsRecord;
import com.soccer.fut7.soccer_system.dto.match.MatchFullRecord;
import com.soccer.fut7.soccer_system.dto.match.MatchStatsDetails;
import com.soccer.fut7.soccer_system.dto.match.MatchTinyDetails;
import com.soccer.fut7.soccer_system.dto.player.PlayerCreateRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerDetailsRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
import com.soccer.fut7.soccer_system.dto.player.PlayerOrganizedRecord;
import com.soccer.fut7.soccer_system.dto.player.PlayerSummaryRecord;
import com.soccer.fut7.soccer_system.dto.referee.RefereeDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamCreateRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamDetailsRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamNameIdRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamScore;
import com.soccer.fut7.soccer_system.dto.team.TeamSummaryRecord;
import com.soccer.fut7.soccer_system.dto.team.TeamWithPlayersRecord;
import com.soccer.fut7.soccer_system.dto.user.UserDetailsRecord;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;
import com.soccer.fut7.soccer_system.dto.utility.AgeRangeRecord;
import com.soccer.fut7.soccer_system.dto.utility.CardsRecord;
import com.soccer.fut7.soccer_system.dto.utility.GoalsRecord;
import com.soccer.fut7.soccer_system.dto.utility.PointsRecord;

@Component
@Lazy
public class EntityDtoMapperDomain {

    // Player Mappings

    public PlayerOrganizedRecord playerToPlayerOrganizedRecord(PlayerStatsDTO player) {
        if (player == null)
            return null;

        return new PlayerOrganizedRecord(
                player.playerId(),
                player.firstName(),
                player.photoUrl(),
                player.jerseyNumber(),
                player.goals(),
                player.points(),
                player.redCards(),
                player.yellowCards(),
                player.teamId(),
                player.teamLogoUrl(),
                player.teamName(),
                player.categoryId(),
                player.categoryName());
    }

    public static PlayerDetailsRecord toRecord(PlayerDetailsDTO dto) {
        return new PlayerDetailsRecord(
                dto.playerId(), // String playerId
                dto.firstName(), // String firstName
                dto.lastName(), // String lastName
                dto.birthDate(), // LocalDate birthDate
                dto.jerseyNumber(), // int jerseyNumber
                dto.age(), // int age
                dto.photoUrl(), // String photoUrl
                dto.playerStatus(), // String playerStatus
                dto.captain(), // boolean captain
                dto.email(), // String email
                dto.goals(), // int goals
                dto.points(), // int points
                dto.yellowCards(), // int yellowCards
                dto.redCards(), // int redCards
                dto.teamId(), // String teamId
                dto.teamName() // String teamName
        );
    }

    public PlayerSummaryRecord playerToPlayerSummaryRecord(Player player) {
        if (player == null)
            return null;

        return new PlayerSummaryRecord(
                player.getId(),
                getFullName(player.getPersonName()),
                jerseyNumberToString(player.getJerseyNumber()));
    }

    public Set<PlayerSummaryRecord> playersToPlayersSummaryRecord(Set<Player> players) {
        if (players == null)
            return null;
        return players.stream().map(this::playerToPlayerSummaryRecord).collect(Collectors.toSet());
    }

    public Player playerCreateRecordToPlayer(PlayerCreateRecord record) {
        if (record == null)
            return null;

        // Assuming Player has a constructor that takes the required fields
        return Player.builder().id(record.playerId())
                .personName(createPersonName(record.firstName() + " " + record.lastName()))
                .email(createEmail(record.email()))
                .birthDate(createBirthDate(record.birthDate())).jerseyNumber(
                        createJerseyNumber(record.jerseyNumber()))
                .team(Team.builder().id(record.teamId()).build())
                .isCaptain(record.captain())
                .age(Integer.valueOf(record.Age())).photo(record.photo()).build();
    }

    public Player initializePlayerDefaults(Player player) {
        if (player == null) {
            throw new IllegalArgumentException("Player object cannot be null");
        }

        if (player.getJerseyNumber() == null) {
            player.setJerseyNumber(new JerseyNumber(0)); // Default jersey number
        }

        if (player.getGoals() == null) {
            player.setGoals(new Goals(0)); // Default goals
        }

        if (player.getPoints() == null) {
            player.setPoints(Points.zero()); // Default points
        }

        if (player.getPhoto() == null || player.getPhoto().isEmpty()) {
            player.setPhoto("default_photo_url"); // Default photo URL
        }

        if (player.getPlayerStatus() == null) {
            player.setPlayerStatus(PlayerStatus.ACTIVO); // Default status
        }

        if (player.getMatchStats() == null) {
            player.setMatchStats(new HashSet<>()); // Default empty set
        }

        if (player.getCards() == null) {
            player.setCards(new Cards(0, 0)); // Default card values (0 red, 0 yellow)
        }

        if (player.getIsCaptain() == null) {
            player.setIsCaptain(false); // Default captain status
        }

        if (player.getEmail() == null) {
            player.setEmail(new Email("default@example.com")); // Default email
        }

        return player;
    }

    //
    public Set<Player> mapPlayers(Set<PlayerCreateRecord> playerRecords) {
        if (playerRecords == null)
            return Collections.emptySet();
        return playerRecords.stream()
                .map(this::playerCreateRecordToPlayer)
                .collect(Collectors.toSet());
    }

    public Set<PlayerDetailsRecord> mapPlayersRecords(Set<Player> playerRecords) {
        if (playerRecords == null)
            return Collections.emptySet();
        return playerRecords.stream()
                .map(this::playerToPlayerCreateRecord)
                .collect(Collectors.toSet());

    }

    public PlayerDetailsRecord playerToPlayerCreateRecord(Player player) {
        if (player == null) {
            return null;
        }

        // Handle null person name
        String firstName = "";
        String lastName = "";
        if (player.getPersonName() != null) {
            firstName = player.getPersonName().firstName() != null ? player.getPersonName().firstName() : "";
            lastName = player.getPersonName().lastName() != null ? player.getPersonName().lastName() : "";
        }

        // Handle match stats - return default values if not found
        int goals = 0;
        int points = 0;
        int yellowCards = 0;
        int redCards = 0;

        goals = player.getGoals() != null ? player.getGoals().value() : 0;
        points = player.getPoints() != null ? player.getPoints().value() : 0;
        yellowCards = player.getCards() != null ? player.getCards().yellowCards() : 0;
        redCards = player.getCards() != null ? player.getCards().redCards() : 0;

        // Handle team info

        UUID teamId;
        String teamName = "";
        if (player.getTeam() != null) {
            teamId = player.getTeam().getId() != null ? player.getTeam().getId() : UUID.randomUUID();
            teamName = player.getTeam().getName() != null ? player.getTeam().getName().value() : "";
        }
        return new PlayerDetailsRecord(
                player.getId().toString(),
                firstName,
                lastName,
                player.getBirthDate() != null ? player.getBirthDate().value() : null,
                player.getJerseyNumber() != null ? player.getJerseyNumber().value() : 0,
                player.getAge(),
                player.getPhoto() != null ? player.getPhoto() : "",
                player.getPlayerStatus() != null ? player.getPlayerStatus().toString() : "",
                player.getIsCaptain(),
                player.getEmail() != null ? player.getEmail().value() : "",
                goals,
                points,
                yellowCards,
                redCards,
                player.getTeam().getId().toString(),
                "");
    }

    public Team teamCreateRecordToTeam(TeamCreateRecord record) {
        if (record == null)
            return null;
        return Team.builder()
                .id(record.id() != null ? record.id() : UUID.randomUUID())
                .name(createTeamName(record.name()))
                .logo(createTeamLogo(record.logo()))
                .numberOfPlayers(record.players().size())
                .players(mapPlayers(record.players()))
                .build();
    }

    public TeamScore teamStatsToTeamScore(TeamStats stats) {
        if (stats == null)
            return null;
        return new TeamScore(stats.getIdTeam(), stats.getNameTeam(), stats.getGoalsWin(), stats.getGoalsAgainst(),
                stats.getPoints(), stats.getLogo());
    }

    public Team teamDetailsRecordToTeam(TeamDetailsRecord record) {
        if (record == null) {
            return null;
        }

        // Build TeamStats first
        TeamStats stats = TeamStats.builder()
                .goalsWin(record.goalsWin() != null ? record.goalsWin().value() : 0)
                .goalsAgainst(record.goalsAgainst() != null ? record.goalsAgainst().value() : 0)
                .points(record.points() != null ? record.points().value() : 0)
                .build();

        // Build the Team using the builder pattern
        return Team.builder()
                .id(record.id())
                .name(TeamName.of(record.name())) // Assuming TeamName.of() handles validation
                .category(categoryCreateRecordToCategory(record.category())) // Use your existing mapper
                .numberOfPlayers(record.numberOfPlayers())
                .stats(stats)
                .logo(createTeamLogo(record.logo()))
                .build();
    }

    public TeamDetailsRecord teamToTeamDetailsRecordWithoutPlayers(Team team) {
        if (team == null) {
            return null;
        }

        return new TeamDetailsRecord(
                team.getId() != null ? team.getId() : UUID.randomUUID(), // or some default UUID
                team.getName() != null ? teamNameToString(team.getName()) : "",
                team.getCategory() != null ? categoryToCategoryInfoRecord(team.getCategory()) : null,
                team.getLogo() != null && team.getLogo().url() != null ? team.getLogo().url() : "",
                team.getNumberOfPlayers() != 0 ? team.getNumberOfPlayers() : 0,
                team.getStats() != null ? goalsToGoalsRecord(Goals.of(
                        team.getStats().getGoalsWin() != 0 ? team.getStats().getGoalsWin() : 0))
                        : goalsToGoalsRecord(Goals.of(0)),
                team.getStats() != null ? goalsToGoalsRecord(Goals.of(
                        team.getStats().getGoalsAgainst() != 0 ? team.getStats().getGoalsAgainst() : 0))
                        : goalsToGoalsRecord(Goals.of(0)),
                team.getStats() != null ? pointsToPointsRecord(Points.of(
                        team.getStats().getPoints() != 0 ? team.getStats().getPoints() : 0))
                        : pointsToPointsRecord(Points.of(0)),
                team.getStats() != null
                        ? team.getStats().getMatchesPlayed() != 0 ? team.getStats().getMatchesPlayed() : 0
                        : 0,
                team.getStats().getMatchesWon() != 0 ? team.getStats().getMatchesWon() : 0,
                team.getStats().getMatchesDrawn() != 0 ? team.getStats().getMatchesDrawn() : 0,
                team.getStats().getMatchesLost() != 0 ? team.getStats().getMatchesLost() : 0,
                team.getStats().isQualified());
    }

    public TeamWithPlayersRecord teamToTeamDetailsRecordWithPlayers(Team team) {
        if (team == null)
            return null;

        return new TeamWithPlayersRecord(
                teamToTeamDetailsRecordWithoutPlayers(team),
                mapPlayersRecords(team.getPlayers()));
    }

    public TeamSummaryRecord teamToTeamSummaryRecord(Team team) {
        if (team == null)
            return null;

        return new TeamSummaryRecord(
                team.getId(),
                teamNameToString(team.getName()),
                goalsToGoalsRecord(Goals.of(team.getStats().getGoalsWin())),
                goalsToGoalsRecord(Goals.of(team.getStats().getGoalsAgainst())),
                pointsToPointsRecord(Points.of(team.getStats().getPoints())),
                team.getNumberOfPlayers());
    }

    // Category Mappings
    public Category categoryCreateRecordToCategory(CategoryInfoRecord record) {
        if (record == null)
            return null;

        return Category.builder()
                .id(record.id())
                .name(createCategoryName(record.name()))
                .ageRange(createAgeRange(record.ageRange()))
                .teams(new HashSet<>())
                .build();
    }

    public CategoryInfoRecord categoryToCategoryInfoRecord(Category category) {
        if (category == null)
            return null;

        return new CategoryInfoRecord(
                category.getId(),
                category.getName() != null ? category.getName().value() : null,
                category.getUrlPhoto(),
                ageRangeToAgeRangeRecord(category.getAgeRange()));
    }

    // User Mappings
    public User userRegisterRecordToUser(UserRegisterRecord record) {
        if (record == null)
            return null;

        return User.builder()
                .personName(createPersonNameFromRegisterRecord(record))
                .birthDate(createBirthDate(record.birthDate()))
                .credentials(createUserCredentials(record))
                .build();
    }

    public UserDetailsRecord userToUserDetailsRecord(User user) {
        if (user == null)
            return null;

        return new UserDetailsRecord(
                user.getId(),
                user.getPersonName() != null ? user.getPersonName().firstName() : null,
                user.getPersonName() != null ? user.getPersonName().lastName() : null,
                user.getBirthDate() != null ? user.getBirthDate().value() : null,
                calculateAge(user.getBirthDate()),
                user.getCredentials().username(),
                user.getRole(),
                user.getStatus());
    }

    // Match Mappings
    public Match matchCreateRecordToMatch(MatchCreateRecord record) {
        if (record == null)
            return null;

        return Match.builder()
                .id(record.matchId())
                .matchDate(createMatchDate(record.matchDate()))
                .status(MatchStatus.POSPONIDO)
                .results(null)
                .build();
    }

    public MatchFullRecord MatchToMatchFullRecord(Match match) {
        return new MatchFullRecord(match.getId(), match.getCategoryId(), match.getMatchDate().value(),
                match.getStatus(),
                UserRefereeToRefereeDetailsRecord(match.getReferee()),
                InfoTeamMatchToMatchDetailsRecord(match.getResults().getHomeTeam()),
                InfoTeamMatchToMatchDetailsRecord(match.getResults().getAwayTeam()));
    }

    RefereeDetailsRecord UserRefereeToRefereeDetailsRecord(User user) {
        return new RefereeDetailsRecord(
                user.getId(),
                user.getPersonName().firstName(),
                user.getPersonName().lastName(),
                user.getRole());
    }

    // Debt Mappings
    public PlayerDebt debtRecordToPlayerDebt(com.soccer.fut7.soccer_system.dto.utility.DebtRecordDto record) {
        if (record == null)
            return null;

        return PlayerDebt.builder()
                .id(record.Id())
                .amount(createMoney(record.amount()))
                .description(record.description())
                .dueDate(createDebtDate(record.dueDate()))
                .status(record.state())
                .build();
    }


    public TeamNameIdRecord teamToTeamNameIdRecord(Team match) {
        if (match == null)
            return null;

        return new TeamNameIdRecord(match.getId(), teamNameToString(match.getName()));
    }

    public List<TeamNameIdRecord> teamsToTeamNameIdRecords(List<Team> teams) {
        if (teams == null)
            return null;

        return teams.stream()
                .map(this::teamToTeamNameIdRecord)
                .collect(Collectors.toList());
    }
    // Collection Mappings
    public Set<PlayerSummaryRecord> playersToPlayerSummaryRecords(List<Player> players) {
        if (players == null)
            return null;
        return players.stream()
                .map(this::playerToPlayerSummaryRecord)
                .collect(Collectors.toSet());
    }

    public Set<PlayerMatchStatsRecordDto> playerMatchStatsToPlayerMatchStatsRecordDto(
            Set<PlayerMatchStats> playerMatchStats) {
        if (playerMatchStats == null) {
            return null;
        }

        return playerMatchStats.stream()
                .map(player -> new PlayerMatchStatsRecordDto(
                        player.getId(),
                        goalsToGoalsRecord(player.getGoals()),
                        player.isAttended(),
                        CardToCardRecord(player.getCards())))
                .collect(Collectors.toSet());
    }

    public PlayerMatchStats PlayerMatchStatsRecordDtoToPlayerMatchStats(
            PlayerMatchStatsRecordDto player) {
        if (player == null) {
            return null;
        }
        return PlayerMatchStats.builder() // ✅ Correct builder usage
                .id(player.playerId())
                .attended(player.attended())
                .cards(Cards.of(player.cards().yellowCards(), player.cards().redCards()))
                .goals(Goals.of(player.goals().value()))
                .build();
    }

    public Set<PlayerMatchStats> PlayerMatchStatsRecordDtoToPlayerMatchStats(
            Set<PlayerMatchStatsRecordDto> playerMatchStats) {
        if (playerMatchStats == null) {
            return null;
        }

        return playerMatchStats.stream()
                .map(player -> {

                    return PlayerMatchStats.builder() // ✅ Correct builder usage
                            .id(player.playerId())
                            .attended(player.attended())
                            .cards(Cards.of(player.cards().yellowCards(), player.cards().redCards()))
                            .goals(Goals.of(player.goals().value()))
                            .build();
                } // ✅ Now the return type is correctly inferred
                )
                .collect(Collectors.toSet()); // ✅ Now Java knows it's a Set<PlayerMatchStats>
    }

    public Set<TeamSummaryRecord> teamsToTeamSummaryRecords(Set<Team> teams) {
        if (teams == null)
            return null;
        return teams.stream()
                .map(this::teamToTeamSummaryRecord)
                .collect(Collectors.toSet());
    }

    public Set<CategoryInfoRecord> categoriesToCategoryInfoRecords(Set<Category> categories) {
        if (categories == null)
            return null;
        return categories.stream()
                .map(this::categoryToCategoryInfoRecord)
                .collect(Collectors.toSet());
    }

    // Utility Methods for Value Object Creation
    private PersonName createPersonName(String fullName) {
        if (fullName == null)
            return null;
        String[] parts = fullName.split(" ", 2);
        return new PersonName(parts[0], parts.length > 1 ? parts[1] : "");
    }

    public MatchTinyDetails matchToMatchTinyDetails(CustomMatchDetails match) {
        if (match == null)
            return null;

        return new MatchTinyDetails(match.getIdMatch(), match.getPhase(), match.getTournament_id(), match.getTourmentName(), match.getStatus(), match.getCategory(),
                CustomMatchDetailsInnerCustomMatchDetails(match.getHomeTeam()),
                CustomMatchDetailsInnerCustomMatchDetails(match.getAwayTeam()));
    }

    public TeamNameIdRecord CustomMatchDetailsInnerCustomMatchDetails(InnerCustomMatchDetails match) {
        if (match == null)
            return null;
        return new TeamNameIdRecord(match.getIdTeam(), match.getNameTeam());
    }

    MatchStatsDetails InfoTeamMatchToMatchDetailsRecord(InfoTeamMatch matchResults) {
        if (matchResults == null)
            return null;

        return new MatchStatsDetails(
                matchResults.name(),
                matchResults.id(),
                goalsToGoalsRecord(matchResults.goalsWin()),
                goalsToGoalsRecord(matchResults.goalsAgainst()),
                PointsRecord.of(matchResults.points().value()),
                playerMatchStatsToPlayerMatchStatsRecordDto(matchResults.infoPlayerMatchStats()));
    }

    InfoTeamMatch MatchDetailsRecordToInforTeamMatch(MatchStatsDetails matchDetailsRecord) {
        return new InfoTeamMatch(
                matchDetailsRecord.name(),
                matchDetailsRecord.id(),
                Goals.of(matchDetailsRecord.goalsWin().value()),
                Goals.of(matchDetailsRecord.goalsAgainst().value()),
                Points.of(matchDetailsRecord.points().value()),
                PlayerMatchStatsRecordDtoToPlayerMatchStats(matchDetailsRecord.infoPlayerMatchStats()));
    }

    MatchDetailsRecord MatchResultsToMatchDetailsRecord(MatchResults matchResults) {
        if (matchResults == null)
            return null;

        return new MatchDetailsRecord(
                matchResults.getIdMatch(),
                InfoTeamMatchToMatchDetailsRecord(matchResults.getHomeTeam()),
                InfoTeamMatchToMatchDetailsRecord(matchResults.getAwayTeam()));

    }

    // public MatchResults MatchDetailsRecordToMatchResult(MatchDetailsRecord matchDetailsRecord) {
    //     if (matchDetailsRecord == null)
    //         return null;

    //     return new MatchResults(
    //             matchDetailsRecord.idMatch(),
    //             MatchDetailsRecordToInforTeamMatch(matchDetailsRecord.homeTeam()),
    //             MatchDetailsRecordToInforTeamMatch(matchDetailsRecord.awayTeam()),
    //             null,
    //             null);

    // }

    private PersonName createPersonNameFromRegisterRecord(UserRegisterRecord record) {
        return new PersonName(record.firstName(), record.lastName());
    }

    private BirthDate createBirthDate(LocalDate date) {
        return date != null ? BirthDate.of(date) : null;
    }

    private JerseyNumber createJerseyNumber(int number) {
        return number != 0 ? JerseyNumber.of(number) : null;
    }

    private Goals createGoals(GoalsRecord record) {
        return record != null ? Goals.of(record.value()) : Goals.zero();
    }

    private Points createPoints(PointsRecord record) {
        return record != null ? Points.of(record.value()) : Points.zero();
    }

    private TeamName createTeamName(String name) {
        return name != null ? TeamName.of(name) : null;
    }

    private TeamLogo createTeamLogo(String url) {
        return url != null ? new TeamLogo(url) : null;
    }

    private CategoryName createCategoryName(String name) {
        return name != null ? CategoryName.of(name) : null;
    }

    private AgeRange createAgeRange(AgeRangeRecord record) {
        return record != null ? AgeRange.of(record.minAge(), record.maxAge()) : null;
    }

    private Email createEmail(String email) {
        return email != null ? Email.of(email) : null;
    }

    private UserCredentials createUserCredentials(UserRegisterRecord record) {
        return record != null ? new UserCredentials(record.user(), "") : null;
    }

    private MatchDate createMatchDate(LocalDate date) {
        return date != null ? MatchDate.of(date) : null;
    }

    private DebtDate createDebtDate(LocalDate date) {
        return date != null ? DebtDate.of(date) : null;
    }

    private Money createMoney(BigDecimal amount) {
        return amount != null ? Money.of(amount) : null;
    }

    // Utility Methods for Record Creation
    private GoalsRecord goalsToGoalsRecord(Goals goals) {
        return goals != null ? new GoalsRecord(goals.value()) : null;
    }

    private PointsRecord pointsToPointsRecord(Points points) {
        return points != null ? new PointsRecord(points.value()) : null;
    }

    /************* ✨ Codeium Command ⭐ *************/
    /**
     * Creates a CardsRecord from a Cards object.
     *
     * @param cards the Cards object to convert
     * @return the CardsRecord with the yellow and red cards
     */
    /****** 3f24e953-a2c1-4f2a-9d5c-836ddbe3d437 *******/
    private CardsRecord CardToCardRecord(Cards cards) {
        return new CardsRecord(cards.yellowCards(), cards.redCards());
    }

    private AgeRangeRecord ageRangeToAgeRangeRecord(AgeRange ageRange) {
        return ageRange != null ? new AgeRangeRecord(ageRange.minAge(), ageRange.maxAge()) : null;
    }

    // Utility Methods for String Conversions
    private String getFullName(PersonName personName) {
        if (personName == null)
            return null;
        return personName.firstName() + " " + personName.lastName();
    }

    private String teamNameToString(TeamName name) {
        return name != null ? name.value() : null;
    }

    private String jerseyNumberToString(JerseyNumber jerseyNumber) {
        return jerseyNumber != null ? String.valueOf(jerseyNumber.value()) : null;
    }

    // Utility Method for Age Calculation
    private Integer calculateAge(BirthDate birthDate) {
        if (birthDate == null || birthDate.value() == null)
            return null;
        LocalDate today = LocalDate.now();
        int age = today.getYear() - birthDate.value().getYear();
        if (today.getMonthValue() < birthDate.value().getMonthValue() ||
                (today.getMonthValue() == birthDate.value().getMonthValue() &&
                        today.getDayOfMonth() < birthDate.value().getDayOfMonth())) {
            age--;
        }
        return age;
    }
}