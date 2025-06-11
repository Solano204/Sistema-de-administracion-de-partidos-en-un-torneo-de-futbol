package com.soccer.fut7.soccer_system.team.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.dto.projection.PlayerWithTeamAndStatsProjection;
import com.soccer.fut7.soccer_system.team.entitiy.PlayerEntity;

@Repository
public interface PlayerRepositoryData extends JpaRepository<PlayerEntity, UUID> {

        // In your repository:
        @Query(value = "SELECT " +
                        "p.id AS playerId, " +
                        "p.first_name AS playerFirstName, " +
                        "p.last_name AS playerLastName, " +
                        "p.age AS playerAge, " +
                        "p.birth_date AS playerBirthDate, " +
                        "p.photo_url AS playerPhotoUrl, " +
                        "p.email AS playerEmail, " +
                        "p.jersey_number AS playerJerseyNumber, " +
                        "p.captain AS playerCaptain, " +
                        "p.player_status AS playerStatus, " +
                        "t.id AS teamId, " +
                        "t.team_name AS teamName, " +
                        "t.logo_url AS teamLogoUrl, " +
                        "t.category_id AS teamCategoryId, " +
                        "t.tournament_id AS teamTournamentId, " +
                        "t.number_of_players AS teamNumberOfPlayers, " +
                        "t.active AS teamActive, " +
                        "c.id AS categoryId, " +
                        "c.category_name AS categoryName, " +
                        "c.min_age AS categoryMinAge, " +
                        "c.max_age AS categoryMaxAge, " +
                        "ps.id AS playerStatsId, " +
                        "ps.goals AS playerStatsGoals, " +
                        "ps.points AS playerStatsPoints, " +
                        "ps.yellow_cards AS playerStatsYellowCards, " +
                        "ps.red_cards AS playerStatsRedCards " +
                        "FROM fut_jaguar.players p " +
                        "LEFT JOIN fut_jaguar.teams t ON p.team_id = t.id " +
                        "LEFT JOIN fut_jaguar.categories c ON t.category_id = c.id " +
                        "LEFT JOIN fut_jaguar.player_stats ps ON p.id = ps.player_id " +
                        "WHERE p.id = :playerId", nativeQuery = true)
        Optional<PlayerWithTeamAndStatsProjection> findPlayerWithTeamAndStats(@Param("playerId") UUID playerId);



    @Query("SELECT p FROM PlayerEntity p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(concat('%', :name,'%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(concat('%', :name,'%'))")
    List<PlayerEntity> findByNameContainingIgnoreCase(@Param("name") String name);
        // In your repository:
        @Query(value = "SELECT " +
                        "p.id, " + // No alias for id
                        "p.first_name AS first_name, " + // Match exact column name
                        "p.last_name AS last_name, " +
                        "p.age, " +
                        "p.birth_date, " + // No alias
                        "p.photo_url, " +
                        "p.email, " +
                        "p.jersey_number, " +
                        "p.captain, " +
                        "p.player_status, " +
                        "p.team_id " + // For the relationship
                        "FROM fut_jaguar.players p " +
                        "WHERE p.id = :playerId", nativeQuery = true)
        Optional<PlayerEntity> findByID(@Param("playerId") UUID playerId);

        @Query(value = """
                        SELECT p.id,p.first_name, p.photo_url, p.jersey_number,
                               ps.goals, ps.points, ps.red_cards, ps.yellow_cards,
                               t.id, t.logo_url, t.team_name, c.id, c.category_name
                        FROM fut_jaguar.players p
                        JOIN fut_jaguar.player_stats ps ON p.id = ps.player_id
                        JOIN fut_jaguar.teams t ON p.team_id = t.id
                        JOIN fut_jaguar.categories c ON t.category_id = c.id
                        WHERE c.id = :categoryId
                        ORDER BY ps.points DESC
                        """, nativeQuery = true)
        List<Object[]> findByTeamCategoryIdOrderByStatsPointsDesc(@Param("categoryId") UUID categoryId);

        @Query(value = """
                            SELECT
                                p.id AS player_id,
                                p.first_name,
                                p.last_name,
                                p.jersey_number,
                                p.photo_url,
                                p.birth_date,
                                p.player_status,
                                p.captain,
                                p.email,
                                p.age,
                                ps.goals,
                                ps.points,
                                ps.jersey_number AS stats_jersey_number,
                                ps.yellow_cards,
                                ps.red_cards,
                                t.id AS team_id,   -- New field added
                                t.team_name
                            FROM fut_jaguar.players p
                            LEFT JOIN fut_jaguar.player_stats ps ON p.id = ps.player_id
                            LEFT JOIN fut_jaguar.teams t ON p.team_id = t.id
                            WHERE p.id = :playerId
                        """, nativeQuery = true)
        public Object getPlayerDetailsById(@Param("playerId") UUID playerId);

        void deleteByTeam_Id(UUID teamId);

        // Update first name
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.firstName = :newFirstName WHERE p.id = :idPlayer")
        void updateFirstName(@Param("idPlayer") UUID idPlayer, @Param("newFirstName") String newFirstName);

        // Update last name
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.lastName = :newLastName WHERE p.id = :idPlayer")
        void updateLastName(@Param("idPlayer") UUID idPlayer, @Param("newLastName") String newLastName);

        // Update jersey number
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.jerseyNumber = :newJerseyNumber WHERE p.id = :idPlayer")
        void updateJerseyNumber(@Param("idPlayer") UUID idPlayer, @Param("newJerseyNumber") Integer newJerseyNumber);

        // Update team
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.team.id = :newTeamId WHERE p.id = :idPlayer")
        void updateTeam(@Param("idPlayer") UUID idPlayer, @Param("newTeamId") UUID newTeamId);

        // Update photo URL
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.photoUrl = :newPhotoUrl WHERE p.id = :idPlayer")
        void updatePhotoUrl(@Param("idPlayer") UUID idPlayer, @Param("newPhotoUrl") String newPhotoUrl);

        // Update birth date
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.birthDate = :newBirthDate WHERE p.id = :idPlayer")
        void updateBirthDate(@Param("idPlayer") UUID idPlayer, @Param("newBirthDate") LocalDate newBirthDate);

        // Update player status
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.playerStatus = :newPlayerStatus WHERE p.id = :idPlayer")
        void updatePlayerStatus(@Param("idPlayer") UUID idPlayer, @Param("newPlayerStatus") String newPlayerStatus);

        // Update captain status

        // Update email
        @Modifying
        @Query("UPDATE PlayerEntity p SET p.email = :newEmail WHERE p.id = :idPlayer")
        void updateEmail(@Param("idPlayer") UUID idPlayer, @Param("newEmail") String newEmail);

        // Combined update
        @Modifying
        @Query("UPDATE PlayerEntity p SET " +
                        "p.firstName = :firstName, " +
                        "p.lastName = :lastName, " +
                        "p.jerseyNumber = :jerseyNumber, " +
                        "p.photoUrl = :photoUrl, " +
                        "p.birthDate = :birthDate, " +
                        "p.playerStatus = :playerStatus, " +
                        "p.captain = :captain, " +
                        "p.email = :email " +
                        "WHERE p.id = :idPlayer")
        void updatePlayer(
                        @Param("idPlayer") UUID idPlayer,
                        @Param("firstName") String firstName,
                        @Param("lastName") String lastName,
                        @Param("jerseyNumber") Integer jerseyNumber,
                        @Param("photoUrl") String photoUrl,
                        @Param("birthDate") LocalDate birthDate,
                        @Param("playerStatus") String playerStatus,
                        @Param("captain") Boolean captain,
                        @Param("email") String email);

        @Modifying
        @Query("DELETE FROM PlayerEntity p WHERE p.team.id = :teamId AND p.id IN :playerIds")
       public void deleteByTeamIdAndPlayerIds(@Param("teamId") UUID teamId,
                        @Param("playerIds") List<UUID> playerIds);
}
