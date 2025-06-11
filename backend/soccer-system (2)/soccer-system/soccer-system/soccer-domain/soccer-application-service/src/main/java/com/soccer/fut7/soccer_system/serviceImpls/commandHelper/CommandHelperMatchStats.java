// package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

// import java.util.Optional;
// import java.util.UUID;

// import org.springframework.stereotype.Component;

// import com.soccer.fut7.soccer_system.Entity.Match;
// import com.soccer.fut7.soccer_system.Entity.MatchResults;
// import com.soccer.fut7.soccer_system.dto.match.MatchDetailsRecord;
// import com.soccer.fut7.soccer_system.dto.match.MatchFullRecord;
// import com.soccer.fut7.soccer_system.mappers.EntityDtoMapper;
// import com.soccer.fut7.soccer_system.ports.outport.MatchRepository;
// import com.soccer.fut7.soccer_system.ports.outport.MatchStatsRepository;
// import com.soccer.fut7.soccer_system.ports.outport.TeamRepository;
// import com.soccer.fut7.soccer_system.exception.MatchException;

// import lombok.AllArgsConstructor;

// @Component
// @AllArgsConstructor
// public class CommandHelperMatchStats {

//     private final MatchStatsRepository matchStatsRepository;
//     private final EntityDtoMapper mapper;
//     private final MatchRepository matchRepository;
//     private final TeamRepository teamRepository;

//    public MatchFullRecord updateMatchStats(UUID categoryId, UUID matchId, MatchDetailsRecord statsRecord) {

//         return mapper.MatchToMatchFullRecord(matchStatsRepository
//                 .updateMatchStats(categoryId, matchId, mapper.MatchDetailsRecordToMatchResult(statsRecord))
//                 .orElseThrow(() -> new MatchException("Failed to update match stats")));
//     }

//     // Get a match with full information including stats
//     public  MatchFullRecord getMatchWithFullDetails(UUID categoryId, UUID matchId) {
//         return mapper.MatchToMatchFullRecord(matchStatsRepository.getMatchWithFullDetails(categoryId, matchId)
//                 .orElseThrow(() -> new MatchException("Failed to update match stats")));
//     }

//     // Delete all match stats for a match
//     public void deleteAllMatchStatsForMatch(UUID matchId) {
//         matchStatsRepository.deleteAllMatchStatsForMatch(matchId);
//     }

//     // Delete all match stats for a team
//     public void deleteAllMatchStatsForTeam(UUID teamId)

//     {
//         matchStatsRepository.deleteAllMatchStatsForTeam(teamId);
//     }

//     // Delete a specific match stat
//     public void deleteMatchStatEntry(UUID matchStatsId) {
//         matchStatsRepository.deleteMatchStatEntry(matchStatsId);
//     }
// }
