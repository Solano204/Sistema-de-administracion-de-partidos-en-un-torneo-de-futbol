package com.soccer.fut7.soccer_system.team.adapter;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;
import com.soccer.fut7.soccer_system.team.helpers.RefereePaymentCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.RefereePaymentMapper;
import com.soccer.fut7.soccer_system.team.repository.UserRepositoryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Pure unit tests. updateOrInsert is the one method in this whole adapter
// layer with genuine branch-on-existing-data logic: it looks up a payment
// by id, and only treats it as "the same payment" (update path) if it ALSO
// has the same matchId - otherwise (not found, or found but for a
// different match) it inserts a new one instead. Both branches, plus the
// "found but different match" edge case specifically, are covered here.
@ExtendWith(MockitoExtension.class)
class RefereePaymentAdapterTest {

    @Mock private RefereePaymentCommandHelperRepository refereePaymentCommandHelperRepository;
    @Mock private RefereePaymentMapper refereePaymentMapper;
    @Mock private UserRepositoryData userRepositoryData;

    private RefereePaymentAdapter refereePaymentAdapter;

    @BeforeEach
    void setUp() {
        refereePaymentAdapter = new RefereePaymentAdapter(refereePaymentCommandHelperRepository, refereePaymentMapper, userRepositoryData);
    }

    private RefereePayment buildPayment(UUID paymentId, UUID refereeId, UUID matchId) {
        return RefereePayment.builder().id(paymentId).idPayment(paymentId)
                .referee(User.builder().id(refereeId).build())
                .matchId(matchId).build();
    }

    @Test
    void updateOrInsert_refereeDoesNotExist_throwsIllegalArgumentException() {
        UUID refereeId = UUID.randomUUID();
        RefereePayment payment = buildPayment(UUID.randomUUID(), refereeId, UUID.randomUUID());
        when(userRepositoryData.findById(refereeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refereePaymentAdapter.updateOrInsert(payment))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateOrInsert_noExistingPaymentWithThatId_insertsANewOne() {
        UUID refereeId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();
        RefereePayment payment = buildPayment(paymentId, refereeId, UUID.randomUUID());
        UserEntity referee = UserEntity.builder().id(refereeId).build();
        RefereePaymentEntity mapped = RefereePaymentEntity.builder().build();
        when(userRepositoryData.findById(refereeId)).thenReturn(Optional.of(referee));
        when(refereePaymentCommandHelperRepository.getPaymentById(paymentId)).thenReturn(Optional.empty());
        when(refereePaymentMapper.toEntity(payment)).thenReturn(mapped);
        when(refereePaymentCommandHelperRepository.insertRefereePayment(mapped, referee)).thenReturn(Optional.empty());

        refereePaymentAdapter.updateOrInsert(payment);

        verify(refereePaymentCommandHelperRepository).insertRefereePayment(mapped, referee);
        verify(refereePaymentCommandHelperRepository, never()).updateRefereePayment(any(), any(), any());
    }

    @Test
    void updateOrInsert_existingPaymentButForADifferentMatch_insertsANewOneRatherThanUpdating() {
        // The exact edge case this method's own logic carves out: a same-id
        // hit that belongs to a different match is NOT treated as the same
        // payment.
        UUID refereeId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();
        RefereePayment payment = buildPayment(paymentId, refereeId, matchId);
        UserEntity referee = UserEntity.builder().id(refereeId).build();
        RefereePaymentEntity existingForDifferentMatch = RefereePaymentEntity.builder()
                .id(paymentId).matchId(UUID.randomUUID()).build();
        RefereePaymentEntity mapped = RefereePaymentEntity.builder().build();
        when(userRepositoryData.findById(refereeId)).thenReturn(Optional.of(referee));
        when(refereePaymentCommandHelperRepository.getPaymentById(paymentId)).thenReturn(Optional.of(existingForDifferentMatch));
        when(refereePaymentMapper.toEntity(payment)).thenReturn(mapped);
        when(refereePaymentCommandHelperRepository.insertRefereePayment(mapped, referee)).thenReturn(Optional.empty());

        refereePaymentAdapter.updateOrInsert(payment);

        verify(refereePaymentCommandHelperRepository).insertRefereePayment(mapped, referee);
        verify(refereePaymentCommandHelperRepository, never()).updateRefereePayment(any(), any(), any());
    }

    @Test
    void updateOrInsert_existingPaymentForTheSameMatch_updatesInsteadOfInserting() {
        UUID refereeId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();
        RefereePayment payment = buildPayment(paymentId, refereeId, matchId);
        UserEntity referee = UserEntity.builder().id(refereeId).build();
        RefereePaymentEntity existingSameMatch = RefereePaymentEntity.builder().id(paymentId).matchId(matchId).build();
        RefereePaymentEntity mapped = RefereePaymentEntity.builder().build();
        when(userRepositoryData.findById(refereeId)).thenReturn(Optional.of(referee));
        when(refereePaymentCommandHelperRepository.getPaymentById(paymentId)).thenReturn(Optional.of(existingSameMatch));
        when(refereePaymentMapper.toEntity(payment)).thenReturn(mapped);
        when(refereePaymentCommandHelperRepository.updateRefereePayment(paymentId, mapped, referee)).thenReturn(Optional.empty());

        refereePaymentAdapter.updateOrInsert(payment);

        verify(refereePaymentCommandHelperRepository).updateRefereePayment(paymentId, mapped, referee);
        verify(refereePaymentCommandHelperRepository, never()).insertRefereePayment(any(), any());
    }

    @Test
    void getPaymentsByDate_noPaymentsFound_returnsOptionalEmptyNotAnEmptyList() {
        when(refereePaymentCommandHelperRepository.getPaymentsByDate(any())).thenReturn(List.of());

        assertThat(refereePaymentAdapter.getPaymentsByDate(java.time.LocalDate.now())).isEmpty();
    }
}
