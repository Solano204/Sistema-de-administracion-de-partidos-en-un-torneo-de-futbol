package com.soccer.fut7.soccer_system.ports.input.service;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.dto.referee.RefereeDetailsRecord;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;

public interface RefereePaymentApplicationService {

    
    Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(UUID refereeId);

    RefereePaymentDetailsRecord insertRefereePayment(RefereePayment payment);

    Set<RefereePaymentDetailsRecord> getPaymentsByDate(LocalDate paymentDate);
    

    RefereePaymentDetailsRecord getPaymentByMatchReferee(UUID matchId, UUID refereeId);
    
    // New methods

     
    RefereePaymentDetailsRecord getPaymentById(UUID paymentId);
    
    void deletePaymentById(UUID paymentId);
    
    RefereePaymentDetailsRecord updateRefereePayment(UUID paymentId, RefereePayment payment);

    RefereePaymentDetailsRecord updateOrInsert(RefereePayment refereeDetailsRecord);
}
