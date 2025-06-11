package com.soccer.fut7.soccer_system.ports.outport;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;

@Repository
public interface RefereePaymentRepository {
    // Get all payments for a specific referee
    Optional<List<RefereePayment>> getAllPaymentsForReferee(UUID refereeId);

    // Insert a new referee payment
    Optional<RefereePayment> insertRefereePayment(RefereePayment payment);

    // Get payments for a specific date
    Optional<List<RefereePayment>> getPaymentsByDate(LocalDate paymentDate);


    Optional<RefereePayment> getPaymentById(UUID paymentId);

    // Delete a payment by ID
    boolean deletePaymentById(UUID paymentId);

    // Update a referee payment
    Optional<RefereePayment> updateRefereePayment(UUID paymentId, RefereePayment payment);

    Optional<RefereePayment> updateOrInsert(RefereePayment payment);

    Optional<RefereePayment> getPaymentByMatchReferee(UUID matchId, UUID refereeId);
}