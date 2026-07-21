package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.RefereePaymentApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - pure delegation to
// RefereePaymentApplicationService; the one thing worth pinning down beyond
// argument pass-through is that deletePaymentById is the only endpoint here
// wrapped in a ResponseEntity (204 No Content) while every other endpoint
// returns its DTO directly.
@ExtendWith(MockitoExtension.class)
class RefereePaymentControllerTest {

    @Mock private RefereePaymentApplicationService refereePaymentApplicationService;

    private RefereePaymentController refereePaymentController;

    @BeforeEach
    void setUp() {
        refereePaymentController = new RefereePaymentController(refereePaymentApplicationService);
    }

    @Test
    void getAllPaymentsForReferee_delegatesDirectlyToTheService() {
        UUID refereeId = UUID.randomUUID();
        Set<RefereePaymentDetailsRecord> payments = Set.of();
        when(refereePaymentApplicationService.getAllPaymentsForReferee(refereeId)).thenReturn(payments);

        assertThat(refereePaymentController.getAllPaymentsForReferee(refereeId)).isSameAs(payments);
    }

    @Test
    void insertRefereePayment_delegatesTheRequestBodyDirectly() {
        RefereePayment payment = mock(RefereePayment.class);
        RefereePaymentDetailsRecord created = mock(RefereePaymentDetailsRecord.class);
        when(refereePaymentApplicationService.insertRefereePayment(payment)).thenReturn(created);

        assertThat(refereePaymentController.insertRefereePayment(payment)).isSameAs(created);
    }

    @Test
    void getPaymentByMatchReferee_delegatesMatchIdAndRefereeIdInOrder() {
        UUID matchId = UUID.randomUUID();
        UUID refereeId = UUID.randomUUID();
        RefereePaymentDetailsRecord payment = mock(RefereePaymentDetailsRecord.class);
        when(refereePaymentApplicationService.getPaymentByMatchReferee(matchId, refereeId)).thenReturn(payment);

        assertThat(refereePaymentController.getPaymentByMatchReferee(matchId, refereeId)).isSameAs(payment);
    }

    @Test
    void deletePaymentById_delegatesThenReturns204NoContent() {
        UUID paymentId = UUID.randomUUID();

        ResponseEntity<Void> response = refereePaymentController.deletePaymentById(paymentId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(refereePaymentApplicationService).deletePaymentById(paymentId);
    }
}
