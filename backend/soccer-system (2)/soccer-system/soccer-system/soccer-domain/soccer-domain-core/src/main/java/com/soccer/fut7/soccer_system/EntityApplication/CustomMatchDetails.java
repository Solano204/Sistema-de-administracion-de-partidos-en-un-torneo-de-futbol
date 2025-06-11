package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.MatchStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.Value;


@Getter
@Builder
@Setter
public class CustomMatchDetails {
    
    private UUID idMatch;
    private String phase;
    private UUID tournament_id;
    private int numberJourney;
    private InnerCustomMatchDetails homeTeam;
    private InnerCustomMatchDetails awayTeam;
    private MatchStatus status;
    private String category;
    private String tourmentName;


    @Getter
    @AllArgsConstructor
    public static  class InnerCustomMatchDetails {
    public UUID idTeam;
        public String nameTeam;
        
    }
}
