package com.soccer.fut7.soccer_system.team.adapter;

import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;

import com.soccer.fut7.soccer_system.EntityApplication.Match;
import com.soccer.fut7.soccer_system.EntityApplication.MatchResults;
import com.soccer.fut7.soccer_system.ports.outport.MatchStatsRepository;


public class MatchStatsAdapter implements MatchStatsRepository{

    @Override
    public Optional<Match> updateMatchStats(UUID categoryId, UUID matchId, MatchResults statsRecord) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateMatchStats'");
    }

    @Override
    public Optional<Match> getMatchWithFullDetails(UUID categoryId, UUID matchId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getMatchWithFullDetails'");
    }

    @Override
    public void deleteAllMatchStatsForMatch(UUID matchId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteAllMatchStatsForMatch'");
    }

    @Override
    public void deleteAllMatchStatsForTeam(UUID teamId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteAllMatchStatsForTeam'");
    }

    @Override
    public void deleteMatchStatEntry(UUID matchStatsId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'deleteMatchStatEntry'");
    }
    
}
