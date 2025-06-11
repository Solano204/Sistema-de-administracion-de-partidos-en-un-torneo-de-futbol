// package com.soccer.fut7.soccer_system.team.adapter;

// import java.util.Optional;
// import java.util.Set;
// import java.util.UUID;

// import org.springframework.stereotype.Component;

// import com.soccer.fut7.soccer_system.Entity.PlayerMatchStats;
// import com.soccer.fut7.soccer_system.dto.player.PlayerMatchStatsRecordDto;
// import com.soccer.fut7.soccer_system.ports.outport.PlayerMatchStatsRepository;
// @Component
// @RequiredArgsConstructor
// public class PlayerStatsAdapter implements PlayerMatchStatsRepository {
//     private final PlayerStatsCommandHelperRepository playerStatsCommandHelperRepository;
//     private final PlayerMatchStatsMapper playerMatchStatsMapper;

//     @Override
//     public void updatePlayerStats(PlayerMatchStats statsRecord) {
//         PlayerMatchStatsEntity playerMatchStatsEntity = playerMatchStatsMapper.toEntity(statsRecord);
//         playerStatsCommandHelperRepository.updatePlayerStats(playerMatchStatsEntity);
//     }

//     @Override
//     public void deletePlayerStat(UUID playerId, UUID matchId) {
//         playerStatsCommandHelperRepository.deletePlayerStat(playerId, matchId);
//     }

//     @Override
//     public void deleteAllUserStatsFromMatch(UUID matchId) {
//         playerStatsCommandHelperRepository.deleteAllUserStatsFromMatch(matchId);
//     }

//     @Override
//     public void deleteUserStatFromMatch(UUID matchId, UUID userId) {
//         playerStatsCommandHelperRepository.deleteUserStatFromMatch(matchId, userId);
//     }

//     @Override
//     public Optional<PlayerMatchStats> updateOrCreatePlayerStatsFromMatch(PlayerMatchStats statsRecord) {
//         PlayerMatchStatsEntity playerMatchStatsEntity = playerMatchStatsMapper.toEntity(statsRecord);
//         return playerStatsCommandHelperRepository.updateOrCreatePlayerStatsFromMatch(playerMatchStatsEntity)
//             .map(playerMatchStatsMapper::toDomain);
//     }

//     @Override
//     public Optional<Set<PlayerMatchStats>> updateOrCreatePlayerStatsFromMatchBatch(Set<PlayerMatchStats> statsRecords) {
//         Set<PlayerMatchStatsEntity> playerMatchStatsEntities = statsRecords.stream()
//             .map(playerMatchStatsMapper::toEntity)
//             .collect(Collectors.toSet());
        
//         return playerStatsCommandHelperRepository.updateOrCreatePlayerStatsFromMatchBatch(playerMatchStatsEntities)
//             .map(entities -> entities.stream()
//                 .map(playerMatchStatsMapper::toDomain)
//                 .collect(Collectors.toSet()));
//     }
// }