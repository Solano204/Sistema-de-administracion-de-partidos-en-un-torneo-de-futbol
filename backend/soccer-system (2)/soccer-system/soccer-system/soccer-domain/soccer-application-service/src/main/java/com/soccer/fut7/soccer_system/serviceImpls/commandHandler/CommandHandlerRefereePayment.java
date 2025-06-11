package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperRefereePayment;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class CommandHandlerRefereePayment {

    private final CommandHelperRefereePayment commandHelperRefereePayment;

    public Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(UUID refereeId) {
        return commandHelperRefereePayment.getAllPaymentsForReferee(refereeId);
    }

    public RefereePaymentDetailsRecord insertRefereePayment(RefereePayment payment) {
        return commandHelperRefereePayment.insertRefereePayment(payment);
    }

    public Set<RefereePaymentDetailsRecord> getPaymentsByDate(LocalDate paymentDate) {
        return commandHelperRefereePayment.getPaymentsByDate(paymentDate);
    }


    public RefereePaymentDetailsRecord getPaymentById(UUID paymentId) {
        return commandHelperRefereePayment.getPaymentById(paymentId);
    }

    public void deletePaymentById(UUID paymentId) {
        commandHelperRefereePayment.deletePaymentById(paymentId);
    }

    public RefereePaymentDetailsRecord updateRefereePayment(UUID paymentId, RefereePayment payment) {
        return commandHelperRefereePayment.updateRefereePayment(paymentId, payment);
    }

    public RefereePaymentDetailsRecord updateOrInsert(RefereePayment payment) {
        return commandHelperRefereePayment.updateOrInsert(payment);
    }

    public RefereePaymentDetailsRecord getPaymentByMatchReferee(UUID matchId, UUID refereeId) {
        return commandHelperRefereePayment.getPaymentByMatchReferee(matchId, refereeId);
    }
}


