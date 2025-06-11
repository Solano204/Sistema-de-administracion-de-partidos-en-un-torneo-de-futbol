package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.sql.Ref;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.ExceptionApplication.RefereePaymentException;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.mappers.RefereeMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.RefereePaymentRepository;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

// Command Helpers
@Slf4j
@Component
@Lazy

@RequiredArgsConstructor
public class CommandHelperRefereePayment {
    private final RefereePaymentRepository refereePaymentRepository;
    private final RefereeMapperDomain refereeMapper;

    @Transactional
    public Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(UUID refereeId) {
        return refereeMapper.RefereePaymentsToRefereePaymentDetailsRecords(
                refereePaymentRepository.getAllPaymentsForReferee(refereeId)
                        .orElseThrow(() -> new RefereePaymentException("No payments found for referee")));
    }

    @Transactional
    public RefereePaymentDetailsRecord insertRefereePayment(RefereePayment payment) {
        return refereeMapper
                .RefereePaymentToRefereePaymentDetailsRecord(refereePaymentRepository.insertRefereePayment(payment)
                        .orElseThrow(() -> new RefereePaymentException("Failed to insert referee payment")));
    }

    @Transactional
    public Set<RefereePaymentDetailsRecord> getPaymentsByDate(LocalDate paymentDate) {
        return refereeMapper.RefereePaymentsToRefereePaymentDetailsRecords(
                refereePaymentRepository.getPaymentsByDate(paymentDate)
                        .orElseThrow(() -> new RefereePaymentException("No payments found for the specified date")));
    }



    @Transactional
    public RefereePaymentDetailsRecord getPaymentById(UUID paymentId) {
        return refereeMapper.RefereePaymentToRefereePaymentDetailsRecord(
                refereePaymentRepository.getPaymentById(paymentId)
                        .orElseThrow(() -> new RefereePaymentException("Payment not found with ID: " + paymentId)));
    }

    @Transactional
    public void deletePaymentById(UUID paymentId) {
        if (!refereePaymentRepository.deletePaymentById(paymentId)) {
            throw new RefereePaymentException("Failed to delete payment with ID: " + paymentId);
        }
    }

    @Transactional
    public RefereePaymentDetailsRecord updateRefereePayment(UUID paymentId, RefereePayment payment) {
        return refereeMapper.RefereePaymentToRefereePaymentDetailsRecord(
                refereePaymentRepository.updateRefereePayment(paymentId, payment)
                        .orElseThrow(() -> new RefereePaymentException("Failed to update payment with ID: " + paymentId)));
    }

    public RefereePaymentDetailsRecord updateOrInsert(RefereePayment payment) { // New methode
        return refereeMapper.RefereePaymentToRefereePaymentDetailsRecord(
                refereePaymentRepository.updateOrInsert(payment)
                        .orElseThrow(() -> new RefereePaymentException("Failed to update or insert payment")));
    }

    public  RefereePaymentDetailsRecord getPaymentByMatchReferee(UUID matchId, UUID refereeId) {
        return refereeMapper.RefereePaymentToRefereePaymentDetailsRecord(
                refereePaymentRepository.getPaymentByMatchReferee(matchId, refereeId)
                        .orElseThrow(() -> new RefereePaymentException("No payment found for the specified match and referee")));
    }
}