package com.soccer.fut7.soccer_system.team.entitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "referee_payments", schema = "fut_jaguar")
public class RefereePaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "referee_id", nullable = false)
    private UserEntity referee;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    // Changed to BigDecimal to match DECIMAL in database
    @Column(name = "hours_worked", nullable = false, precision = 5, scale = 2)
    private BigDecimal hoursWorked;

    @Column(name = "hourly_rate_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRateAmount;

    @Column(name = "total_payment_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPaymentAmount;

    @Column(name = "match_id", nullable = false)
    private UUID matchId;

    @Column(nullable = false, length = 3)
    private String currency = "USD";
}