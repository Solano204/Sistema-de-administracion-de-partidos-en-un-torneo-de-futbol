package com.soccer.fut7.soccer_system.mappers;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.RefereePayment;
import com.soccer.fut7.soccer_system.EntityApplication.User;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;
import com.soccer.fut7.soccer_system.ValueObject.UserCredentials;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;
import com.soccer.fut7.soccer_system.dto.referee.RefereePaymentDetailsRecord;
import com.soccer.fut7.soccer_system.dto.referee.UserDetailsRecordFull;
import com.soccer.fut7.soccer_system.dto.referee.UserRefereeSummaryRecord;
import com.soccer.fut7.soccer_system.dto.user.UserRegisterRecord;

@Component
@Lazy
public class RefereeMapperDomain {


   
    public RefereePaymentDetailsRecord RefereePaymentToRefereePaymentDetailsRecord(RefereePayment refereePayment) {
        return new RefereePaymentDetailsRecord(
            refereePayment.getId(),
            UserToUserRefereeSummaryRecord(
                refereePayment.getReferee().getId(),
                "",
                ""
            ),
            refereePayment.getPaymentDate().value(),
            refereePayment.getHoursWorked() ,
            refereePayment.getHourlyRate().amount(),
            refereePayment.getAmount().amount(),
            refereePayment.getMatchId()
        );
    }
    
    public Set<RefereePaymentDetailsRecord> RefereePaymentsToRefereePaymentDetailsRecords(List<RefereePayment> refereePayments) {
        if (refereePayments == null || refereePayments.isEmpty()) {
            return Set.of(); // Return an empty set if input is null or empty
        }
    
        return refereePayments.stream()
                .map(refereePayment -> new RefereePaymentDetailsRecord(
                    refereePayment.getIdPayment(),
                    UserToUserRefereeSummaryRecord(
                        refereePayment.getReferee().getId(),
                        refereePayment.getReferee().getPersonName().firstName(),
                        refereePayment.getReferee().getPersonName().lastName()
                    ),
                    refereePayment.getPaymentDate().value(),
                    refereePayment.getHoursWorked(),
                    refereePayment.getHourlyRate().amount(),
                    refereePayment.getAmount().amount(),
                    refereePayment.getMatchId()
                ))
                .collect(Collectors.toSet());
    }
    // ✅ Added 'public' to make sure it is accessible
    public UserRefereeSummaryRecord UserToUserRefereeSummaryRecord(UUID idUser, String name, String lastName) {
        return new UserRefereeSummaryRecord(
            idUser,
            name + " " + lastName
        );
    }
    

}
