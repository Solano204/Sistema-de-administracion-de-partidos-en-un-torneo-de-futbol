// package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

// import java.util.Optional;
// import java.util.Set;
// import java.util.UUID;

// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import com.soccer.fut7.soccer_system.Entity.PlayerMatchStats;
// import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
// import com.soccer.fut7.soccer_system.exception.PlayerStatsException;
// import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperPlayerStats;

// import lombok.AllArgsConstructor;

// @Component
// @AllArgsConstructor
// public class CommandHandlerPlayerStats {
//     private final CommandHelperPlayerStats commandHelperPlayerStats;




//     @Transactional
//     public PlayerMatchStats createPlayerStatsFromMatch(PlayerMatchStatsRecordDto statsRecord) {
//         return commandHelperPlayerStats.createPlayerStatsFromMatch(statsRecord);
//     }
//     @Transactional
//     public Optional<Set<PlayerMatchStats>> updateOrCreatePlayerStatsFromMatchBatch(Set<PlayerMatchStats> statsRecord) {
//         return commandHelperPlayerStats.updateOrCreatePlayerStatsFromMatchBatch(statsRecord);
//     }
    
    

//     @Transactional
//     public void updatePlayerStats(PlayerMatchStatsRecordDto statsRecord) {
//         commandHelperPlayerStats.updatePlayerStats(statsRecord);
//     }

//     @Transactional
//     public void deletePlayerStat(UUID playerId, UUID matchId) {
//         commandHelperPlayerStats.deletePlayerStat(playerId, matchId);
//     }

//     @Transactional
//     public void deleteAllUserStatsFromMatch(UUID matchId) {
//         commandHelperPlayerStats.deleteAllUserStatsFromMatch(matchId);
//     }
// }
