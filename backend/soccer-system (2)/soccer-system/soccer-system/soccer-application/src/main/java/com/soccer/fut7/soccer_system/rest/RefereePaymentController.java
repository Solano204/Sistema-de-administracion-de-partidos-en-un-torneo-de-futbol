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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Referee Payments", description = "Payments owed to referees for officiating matches. Every endpoint requires a session.")
@SecurityRequirement(name = "Bearer Authentication")
@RestController
@RequestMapping("/referee-payments")
@AllArgsConstructor
@Lazy

public class RefereePaymentController {

    @Autowired
    private RefereePaymentApplicationService refereePaymentApplicationService;

    // "/referee/{refereeId}", not bare "/{refereeId}": that collided with
    // GET/PUT/DELETE "/{paymentId}" below - same single-segment shape, different
    // param name, which Spectral's path-params rule correctly flags as an
    // ambiguous OpenAPI path (and which a plain URL-based router genuinely
    // can't disambiguate). Mirrors the existing "/payment/{paymentId}" convention.
    @Operation(summary = "List all payments for a referee")
    @ApiResponse(responseCode = "200", description = "Payments returned (possibly empty)")
    @GetMapping("/referee/{refereeId}")
    public Set<RefereePaymentDetailsRecord> getAllPaymentsForReferee(@PathVariable UUID refereeId) {
        return refereePaymentApplicationService.getAllPaymentsForReferee(refereeId);
    }

    @Operation(summary = "Create a referee payment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment created"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    public RefereePaymentDetailsRecord insertRefereePayment(@RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.insertRefereePayment(payment);
    }

    @Operation(summary = "Update a referee payment if it exists, otherwise create it")
    @ApiResponse(responseCode = "200", description = "Payment created or updated")
    @PostMapping("/update-or-insert")
    public RefereePaymentDetailsRecord updateOrInsert (@RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.updateOrInsert(payment);
    }

    @Operation(summary = "List payments made on a given date")
    @ApiResponse(responseCode = "200", description = "Payments returned (possibly empty)")
    @GetMapping("/date")
    public Set<RefereePaymentDetailsRecord> getPaymentsByDate(@RequestParam LocalDate paymentDate) {
        return refereePaymentApplicationService.getPaymentsByDate(paymentDate);
    }


    @Operation(summary = "Get the payment for a specific match and referee")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment found"),
        @ApiResponse(responseCode = "404", description = "No payment exists for that match and referee")
    })
    @GetMapping("/payment-by-match-referee/{matchId}/{refereeId}")
    public RefereePaymentDetailsRecord getPaymentByMatchReferee(@PathVariable UUID matchId, @PathVariable UUID refereeId) {
        return refereePaymentApplicationService.getPaymentByMatchReferee(matchId, refereeId);
    }

    @Operation(summary = "Get a payment by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment found"),
        @ApiResponse(responseCode = "404", description = "No payment exists with that id")
    })
    @GetMapping("/payment/{paymentId}")
    public RefereePaymentDetailsRecord getPaymentById(@PathVariable UUID paymentId) {
        return refereePaymentApplicationService.getPaymentById(paymentId);
    }

    @Operation(summary = "Delete a payment by id")
    @ApiResponse(responseCode = "204", description = "Payment deleted")
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePaymentById(@PathVariable UUID paymentId) {
        refereePaymentApplicationService.deletePaymentById(paymentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a referee payment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Payment updated"),
        @ApiResponse(responseCode = "404", description = "No payment exists with that id")
    })
    @PutMapping("/{paymentId}")
    public RefereePaymentDetailsRecord updateRefereePayment(
            @PathVariable UUID paymentId,
            @RequestBody RefereePayment payment) {
        return refereePaymentApplicationService.updateRefereePayment(paymentId, payment);
    }
}
