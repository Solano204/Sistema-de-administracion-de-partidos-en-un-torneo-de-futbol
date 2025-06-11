// package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

// import java.util.UUID;

// import org.springframework.stereotype.Component;

// import com.fasterxml.jackson.databind.deser.DataFormatReaders.Match;
// import com.soccer.fut7.soccer_system.dto.match.MatchDetailsRecord;
// import com.soccer.fut7.soccer_system.dto.match.MatchFullRecord;
// import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperMatchStats;

// import lombok.AllArgsConstructor;

// @Component
// @AllArgsConstructor

// public class CommandHandlerMachStats {
//     private final CommandHelperMatchStats commandHelperMatchStats;
//     MatchFullRecord updateMatchStats(UUID categoryId, UUID matchId, MatchDetailsRecord statsRecord) {

//         return commandHelperMatchStats.updateMatchStats(categoryId, matchId, statsRecord);
//     }

//     // Get a match with full information including stats
//     MatchFullRecord getMatchWithFullDetails(UUID categoryId, UUID matchId) {
//         return commandHelperMatchStats.getMatchWithFullDetails(categoryId, matchId);
//     }

//     // Delete all match stats for a match
//     void deleteAllMatchStatsForMatch(UUID matchId) {
//         commandHelperMatchStats.deleteAllMatchStatsForMatch(matchId);
//     }

//     // Delete all match stats for a team
//     void deleteAllMatchStatsForTeam(UUID teamId)

//     {
//        commandHelperMatchStats.deleteAllMatchStatsForMatch(teamId);
//     }

//     // Delete a specific match stat
//     void deleteMatchStatEntry(UUID matchStatsId) {
//         commandHelperMatchStats.deleteMatchStatEntry(matchStatsId);
//     }
// }
