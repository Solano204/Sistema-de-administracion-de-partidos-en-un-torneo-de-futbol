package com.soccer.fut7.soccer_system.team.helpers;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.repository.RefereePaymentRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class RefereePaymentCommandHelperRepository {
    private final RefereePaymentRepositoryData refereePaymentRepositoryData;
    

    public List<RefereePaymentEntity> getAllPaymentsForReferee(UUID refereeId) {
        return refereePaymentRepositoryData.findByReferee_IdOrderByPaymentDateDesc(refereeId);
    }
    
    public Optional<RefereePaymentEntity> insertRefereePayment(RefereePaymentEntity paymentEntity, UserEntity refereeEntity) {
        RefereePaymentEntity savedPayment = refereePaymentRepositoryData.save(paymentEntity);
        savedPayment.setReferee(refereeEntity);
        return Optional.of(savedPayment);
    }
    
    public List<RefereePaymentEntity> getPaymentsByDate(LocalDate paymentDate) {
        return refereePaymentRepositoryData.findByPaymentDateOrderByReferee_LastNameAsc(paymentDate);
    }


    public Optional<RefereePaymentEntity> getPaymentById(UUID paymentId) {
        return refereePaymentRepositoryData.findById(paymentId);
    }
    
    public boolean deletePaymentById(UUID paymentId) {
        if (refereePaymentRepositoryData.existsById(paymentId)) {
            refereePaymentRepositoryData.deleteById(paymentId);
            return true;
        }
        return false;
    }
    
    public Optional<RefereePaymentEntity> updateRefereePayment(UUID paymentId, RefereePaymentEntity paymentEntity, UserEntity refereeEntity) {
        return refereePaymentRepositoryData.findById(paymentId)
                .map(existingPayment -> {
                    // Preserve the ID
                    paymentEntity.setId(paymentId);
                    // Set the referee
                    paymentEntity.setReferee(refereeEntity);
                    // Save the updated entity
                    return refereePaymentRepositoryData.save(paymentEntity);
                });
    }


    public Optional<RefereePaymentEntity> getPaymentByMatchReferee(UUID matchId, UUID refereeId) {
        return refereePaymentRepositoryData.findByMatchIdAndReferee_Id(matchId, refereeId);
    }
}