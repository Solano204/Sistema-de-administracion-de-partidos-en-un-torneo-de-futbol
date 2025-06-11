package com.soccer.fut7.soccer_system.rest;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.ports.input.service.RefereePaymentApplicationService;

import lombok.AllArgsConstructor;
@RestController
@RequestMapping("/referee-payments")
@AllArgsConstructor
@Lazy

public class RefereePaymentController {
    
    @Autowired
    private RefereePaymentApplicationService refereePaymentApplicationService;
    
    @GetMapping("/{refereeId}")
    public Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(@PathVariable UUID refereeId) {
        return refereePaymentApplicationService.getAllPaymentsForReferee(refereeId);
    }
    
    @PostMapping
    public RefereePaymentDetailsRecord insertRefereePayment(@RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.insertRefereePayment(payment);
    }
    @PostMapping("/update-or-insert")
    public RefereePaymentDetailsRecord updateOrInsert (@RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.updateOrInsert(payment);
    }
    
    @GetMapping("/date")
    public Set<RefereePaymentDetailsRecord> getPaymentsByDate(@RequestParam LocalDate paymentDate) {
        return refereePaymentApplicationService.getPaymentsByDate(paymentDate);
    }


    @GetMapping("/payment-by-match-referee/{matchId}/{refereeId}")
    public RefereePaymentDetailsRecord getPaymentByMatchReferee(@PathVariable UUID matchId, @PathVariable UUID refereeId) {
        return refereePaymentApplicationService.getPaymentByMatchReferee(matchId, refereeId);
    }

    @GetMapping("/payment/{paymentId}")
    public RefereePaymentDetailsRecord getPaymentById(@PathVariable UUID paymentId) {
        return refereePaymentApplicationService.getPaymentById(paymentId);
    }
    
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePaymentById(@PathVariable UUID paymentId) {
        refereePaymentApplicationService.deletePaymentById(paymentId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{paymentId}")
    public RefereePaymentDetailsRecord updateRefereePayment(
            @PathVariable UUID paymentId,
            @RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.updateRefereePayment(paymentId, payment);
    }
}