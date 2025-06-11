package com.soccer.fut7.soccer_system.team.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;

@Repository
public interface RefereePaymentRepositoryData extends JpaRepository<RefereePaymentEntity, UUID> {
    List<RefereePaymentEntity> findByReferee_IdOrderByPaymentDateDesc(UUID refereeId);

    List<RefereePaymentEntity> findByPaymentDateOrderByReferee_LastNameAsc(LocalDate paymentDate);

    // In RefereePaymentRepositoryData interface
        Optional<RefereePaymentEntity> findByMatchIdAndReferee_Id(UUID matchId, UUID refereeId);
}