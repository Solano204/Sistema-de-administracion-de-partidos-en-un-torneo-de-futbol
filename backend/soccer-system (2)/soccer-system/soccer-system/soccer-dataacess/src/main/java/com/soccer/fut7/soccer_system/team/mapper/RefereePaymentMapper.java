package com.soccer.fut7.soccer_system.team.mapper;

import java.math.BigDecimal;
import java.util.Currency;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.Money;
import com.soccer.fut7.soccer_system.ValueObject.PaymentDate;
import com.soccer.fut7.soccer_system.team.entitiy.RefereePaymentEntity;
import com.soccer.fut7.soccer_system.team.entitiy.UserEntity;

import lombok.RequiredArgsConstructor;

@Component
@Lazy

@RequiredArgsConstructor
public class RefereePaymentMapper implements EntityMapper<RefereePayment, RefereePaymentEntity> {

    private final UserMapper userMapper;

    @Override
    public RefereePaymentEntity toEntity(RefereePayment domain) {
        if (domain == null)
            return null;

        UserEntity refereeEntity = new UserEntity();
        refereeEntity.setId(domain.getReferee().getId());

        return RefereePaymentEntity.builder()
                .id(domain.getIdPayment())
                .matchId(domain.getMatchId())
                .referee(refereeEntity)
                .paymentDate(domain.getPaymentDate().value())
                .hoursWorked(BigDecimal.valueOf(domain.getHoursWorked()))
                .hourlyRateAmount(domain.getHourlyRate().amount())
                .totalPaymentAmount(domain.getAmount().amount())
                .currency(domain.getAmount().currency().getCurrencyCode())
                .build();
    }

    @Override
    public RefereePayment toDomain(RefereePaymentEntity entity) {
        if (entity == null)
            return null;

        User referee = userMapper.toDomain(entity.getReferee());
        return RefereePayment.builder()
                .id(entity.getId())
                .idPayment(entity.getId())
                .matchId(entity.getMatchId())
                .referee(referee)
                .paymentDate(entity.getPaymentDate() != null ? new PaymentDate(entity.getPaymentDate()) : null)
                .hoursWorked(Double.valueOf(entity.getHoursWorked().toString()))
                .hourlyRate(new Money(entity.getHourlyRateAmount(), Currency.getInstance(entity.getCurrency())))
                .amount(new Money(entity.getTotalPaymentAmount(), Currency.getInstance(entity.getCurrency())))
                .build();
    }

    public RefereePayment toDomainWithReferee(RefereePaymentEntity entity) {
        if (entity == null)
            return null;

        return RefereePayment.builder()
                .idPayment(entity.getId())
                .referee(userMapper.toDomain(entity.getReferee()))
                .paymentDate(entity.getPaymentDate() != null ? new PaymentDate(entity.getPaymentDate()) : null)
                .hoursWorked(Double.valueOf(entity.getHoursWorked().toString()))
                .hourlyRate(new Money(entity.getHourlyRateAmount(), Currency.getInstance(entity.getCurrency())))
                .amount(new Money(entity.getTotalPaymentAmount(), Currency.getInstance(entity.getCurrency())))
                .build();
    }
}