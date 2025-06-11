// package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

// import lombok.extern.slf4j.Slf4j;

// import java.util.Optional;
// import java.util.Set;
// import java.util.UUID;

// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import com.soccer.fut7.soccer_system.Entity.PlayerMatchStats;
// import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
// import com.soccer.fut7.soccer_system.exception.PlayerStatsException;
// import com.soccer.fut7.soccer_system.mappers.EntityDtoMapper;
// import com.soccer.fut7.soccer_system.ports.outport.PlayerStatsRepository;

// import lombok.*;

// // Command Helper
// @Slf4j
// @Component
// @RequiredArgsConstructor
// public class CommandHelperPlayerStats {
//     private final PlayerStatsRepository playerStatsRepository;
//     private final EntityDtoMapper mapper;

//     @Transactional
//     public PlayerMatchStats createPlayerStatsFromMatch(PlayerMatchStatsRecordDto statsRecord) {

//         ;
//         return playerStatsRepository.updateOrCreatePlayerStatsFromMatch(mapper.PlayerMatchStatsRecordDtoToPlayerMatchStats(statsRecord))
//             .orElseThrow(() -> new PlayerStatsException("Failed to create player stats"));
//     }
//     @Transactional
//     public Optional<Set<PlayerMatchStats>> updateOrCreatePlayerStatsFromMatchBatch(Set<PlayerMatchStats> statsRecord) {
//         Optional<Set<PlayerMatchStatsRecordDto>> dtoStats = playerStatsRepository.updateOrCreatePlayerStatsFromMatchBatch(statsRecord);
        
//         if (dtoStats.isPresent()) {
//             return Optional.of(mapper.PlayerMatchStatsRecordDtoToPlayerMatchStats(dtoStats.get()));
//         } else {
//             throw new PlayerStatsException("Failed to create player stats");
//         }
//     }
    
    

//     @Transactional
//     public void updatePlayerStats(PlayerMatchStatsRecordDto statsRecord) {
//         playerStatsRepository.updatePlayerStats((mapper.PlayerMatchStatsRecordDtoToPlayerMatchStats(statsRecord)));
//     }

//     @Transactional
//     public void deletePlayerStat(UUID playerId, UUID matchId) {
//         playerStatsRepository.deletePlayerStat(playerId, matchId);
//     }

//     @Transactional
//     public void deleteAllUserStatsFromMatch(UUID matchId) {
//         playerStatsRepository.deleteAllUserStatsFromMatch(matchId);
//     }
// }