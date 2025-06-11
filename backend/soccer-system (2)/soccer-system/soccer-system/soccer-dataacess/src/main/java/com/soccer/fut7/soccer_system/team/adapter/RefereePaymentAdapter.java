package com.soccer.fut7.soccer_system.team.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.ports.outport.RefereePaymentRepository;
import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;
import com.soccer.fut7.soccer_system.team.helpers.RefereePaymentCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.RefereePaymentMapper;
import com.soccer.fut7.soccer_system.team.repository.UserRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class RefereePaymentAdapter implements RefereePaymentRepository {
    private final RefereePaymentCommandHelperRepository refereePaymentCommandHelperRepository;
    private final RefereePaymentMapper refereePaymentMapper;
    private final UserRepositoryData userRepositoryData;

    @Override
    public Optional<List<RefereePayment>> getAllPaymentsForReferee(UUID refereeId) {
        return userRepositoryData.findById(refereeId)
            .map(refereeEntity -> {
                List<RefereePaymentEntity> paymentEntities = refereePaymentCommandHelperRepository.getAllPaymentsForReferee(refereeId);
                return paymentEntities.stream()
                    .map(refereePaymentMapper::toDomain)
                    .collect(Collectors.toList());
            });
    }

    @Override
    public Optional<RefereePayment> insertRefereePayment(RefereePayment payment) {
        // Verify referee exists before creating payment
        return userRepositoryData.findById(payment.getReferee().getId())
            .map(refereeEntity -> {
                RefereePaymentEntity paymentEntity = refereePaymentMapper.toEntity(payment);
                return refereePaymentCommandHelperRepository.insertRefereePayment(paymentEntity,refereeEntity)
                    .map(refereePaymentMapper::toDomainWithReferee);
            })
            .orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + payment.getReferee().getId()));
    }

    @Override
    public Optional<List<RefereePayment>> getPaymentsByDate(LocalDate paymentDate) {
        List<RefereePaymentEntity> paymentEntities = refereePaymentCommandHelperRepository.getPaymentsByDate(paymentDate);
        
        if (paymentEntities.isEmpty()) {
            return Optional.empty();
        }
        
        List<RefereePayment> payments = paymentEntities.stream()
            .map(refereePaymentMapper::toDomain)
            .collect(Collectors.toList());
        
        return Optional.of(payments);
    }

    @Override
    public Optional<RefereePayment> getPaymentById(UUID paymentId) {
        return refereePaymentCommandHelperRepository.getPaymentById(paymentId)
                .map(refereePaymentMapper::toDomain);
    }

    @Override
    public boolean deletePaymentById(UUID paymentId) {
        return refereePaymentCommandHelperRepository.deletePaymentById(paymentId);
    }

    @Override
    public Optional<RefereePayment> updateRefereePayment(UUID paymentId, RefereePayment payment) {
        // Verify referee exists before updating payment
        return userRepositoryData.findById(payment.getReferee().getId())
                .map(refereeEntity -> {
                    RefereePaymentEntity paymentEntity = refereePaymentMapper.toEntity(payment);
                    return refereePaymentCommandHelperRepository.updateRefereePayment(paymentId, paymentEntity, refereeEntity)
                            .map(refereePaymentMapper::toDomainWithReferee);
                })
                .orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + payment.getReferee().getId()));
    }




      @Override
    public Optional<RefereePayment> updateOrInsert(RefereePayment payment) {
        // Verify referee exists first
        return userRepositoryData.findById(payment.getReferee().getId())
            .map(refereeEntity -> {
                // Check if payment already exists
                Optional<RefereePaymentEntity> existingPayment = refereePaymentCommandHelperRepository
                    .getPaymentById(payment.getId());
                
                if (existingPayment.isPresent() && existingPayment.get().getMatchId().equals(payment.getMatchId())) {
                    // Update existing payment
                    return refereePaymentCommandHelperRepository
                        .updateRefereePayment(payment.getId(), refereePaymentMapper.toEntity(payment), refereeEntity)
                        .map(refereePaymentMapper::toDomainWithReferee);
                } else {
                    // Insert new payment
                    return refereePaymentCommandHelperRepository
                        .insertRefereePayment(refereePaymentMapper.toEntity(payment), refereeEntity)
                        .map(refereePaymentMapper::toDomainWithReferee);
                }
            })
            .orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + payment.getReferee().getId()));
    }

      @Override
      public Optional<RefereePayment> getPaymentByMatchReferee(UUID matchId, UUID refereeId) {
          return refereePaymentCommandHelperRepository.getPaymentByMatchReferee(matchId, refereeId)
                  .map(refereePaymentMapper::toDomain);
      }
}