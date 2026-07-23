package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.ExceptionApplication.RefereePaymentException;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.mappers.RefereeMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.RefereePaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - thin repository+mapper delegation.
// deletePaymentById is the one method here that differs: it checks a
// boolean return value rather than an Optional, so it gets its own
// dedicated pair of tests.
@ExtendWith(MockitoExtension.class)
class CommandHelperRefereePaymentTest {

    @Mock private RefereePaymentRepository refereePaymentRepository;
    @Mock private RefereeMapperDomain refereeMapper;

    private CommandHelperRefereePayment commandHelperRefereePayment;

    @BeforeEach
    void setUp() {
        commandHelperRefereePayment = new CommandHelperRefereePayment(refereePaymentRepository, refereeMapper);
    }

    @Test
    void getAllPaymentsForReferee_repositoryReturnsEmpty_throwsRefereePaymentException() {
        UUID refereeId = UUID.randomUUID();
        when(refereePaymentRepository.getAllPaymentsForReferee(refereeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperRefereePayment.getAllPaymentsForReferee(refereeId))
                .isInstanceOf(RefereePaymentException.class);
    }

    @Test
    void insertRefereePayment_repositoryFailsToInsert_throwsRefereePaymentException() {
        RefereePayment payment = mock(RefereePayment.class);
        when(refereePaymentRepository.insertRefereePayment(payment)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperRefereePayment.insertRefereePayment(payment))
                .isInstanceOf(RefereePaymentException.class);
    }

    @Test
    void getPaymentById_notFound_throwsRefereePaymentExceptionMentioningTheId() {
        UUID paymentId = UUID.randomUUID();
        when(refereePaymentRepository.getPaymentById(paymentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperRefereePayment.getPaymentById(paymentId))
                .isInstanceOf(RefereePaymentException.class)
                .hasMessageContaining(paymentId.toString());
    }

    // ── deletePaymentById: boolean check, not Optional ─────────────────────

    @Test
    void deletePaymentById_repositoryReturnsFalse_throwsRefereePaymentException() {
        UUID paymentId = UUID.randomUUID();
        when(refereePaymentRepository.deletePaymentById(paymentId)).thenReturn(false);

        assertThatThrownBy(() -> commandHelperRefereePayment.deletePaymentById(paymentId))
                .isInstanceOf(RefereePaymentException.class);
    }

    @Test
    void deletePaymentById_repositoryReturnsTrue_doesNotThrow() {
        UUID paymentId = UUID.randomUUID();
        when(refereePaymentRepository.deletePaymentById(paymentId)).thenReturn(true);

        commandHelperRefereePayment.deletePaymentById(paymentId);

        verify(refereePaymentRepository).deletePaymentById(paymentId);
    }
}
