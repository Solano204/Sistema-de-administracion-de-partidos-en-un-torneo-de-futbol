package com.soccer.fut7.soccer_system.serviceImpls;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.dto.referee.RefereeDetailsRecord;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.RefereePaymentApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerRefereePayment;

import lombok.RequiredArgsConstructor;

@Service
@Lazy
@RequiredArgsConstructor
public class RefereePaymentApplicationServiceImpl implements RefereePaymentApplicationService {

    private final CommandHandlerRefereePayment commandHandlerRefereePayment;

    @Override
    public Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(UUID refereeId) {
        return commandHandlerRefereePayment.getAllPaymentsForReferee(refereeId);
    }

    @Override
    public RefereePaymentDetailsRecord insertRefereePayment(RefereePayment payment) {
        return commandHandlerRefereePayment.insertRefereePayment(payment);
    }

    @Override
    public Set<RefereePaymentDetailsRecord> getPaymentsByDate(LocalDate paymentDate) {
        return commandHandlerRefereePayment.getPaymentsByDate(paymentDate);
    }

    @Override
    public RefereePaymentDetailsRecord getPaymentById(UUID paymentId) {
        return commandHandlerRefereePayment.getPaymentById(paymentId);
    }

    @Override
    public void deletePaymentById(UUID paymentId) {
        commandHandlerRefereePayment.deletePaymentById(paymentId);
    }

    @Override
    public RefereePaymentDetailsRecord updateRefereePayment(UUID paymentId, RefereePayment payment) {
        return commandHandlerRefereePayment.updateRefereePayment(paymentId, payment);
    }

    @Override
    public RefereePaymentDetailsRecord updateOrInsert(RefereePayment refereeDetailsRecord) {
        return commandHandlerRefereePayment.updateOrInsert(refereeDetailsRecord);
    }

    @Override
    public RefereePaymentDetailsRecord getPaymentByMatchReferee(UUID matchId, UUID refereeId) {
        return commandHandlerRefereePayment.getPaymentByMatchReferee(matchId, refereeId);
    }
}
