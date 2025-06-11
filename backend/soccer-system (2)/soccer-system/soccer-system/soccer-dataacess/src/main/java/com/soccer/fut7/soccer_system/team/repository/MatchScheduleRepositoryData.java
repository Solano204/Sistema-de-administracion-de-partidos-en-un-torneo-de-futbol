package com.soccer.fut7.soccer_system.team.repository;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;
import com.soccer.fut7.soccer_system.team.entitiy.MatchSchedule;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MatchScheduleRepositoryData extends JpaRepository<MatchSchedule, UUID> {

        @Query(value = "SELECT * FROM fut_jaguar.get_matches_in_date_range_fn(:startDate, :endDate)", nativeQuery = true)
        List<MatchSchedule> getMatchesInDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Modifying
        @Transactional
        @Query(value = "DELETE FROM fut_jaguar.weekly_schedule WHERE match_id = :matchId", nativeQuery = true)
        int deleteByMatchId(@Param("matchId") UUID matchId); // Returns number of deleted rows



        @Query(value = "SELECT * FROM fut_jaguar.weekly_schedule WHERE match_id = :matchId", nativeQuery = true)
        @Transactional
        MatchSchedule existingMatchSchedule(UUID matchId);



        @Transactional
        @Modifying
        @Query(value = "UPDATE fut_jaguar.weekly_schedule SET status = :status WHERE match_id = :matchId", nativeQuery = true)
        int updateMatchStatus(UUID matchId, String status);


        
}