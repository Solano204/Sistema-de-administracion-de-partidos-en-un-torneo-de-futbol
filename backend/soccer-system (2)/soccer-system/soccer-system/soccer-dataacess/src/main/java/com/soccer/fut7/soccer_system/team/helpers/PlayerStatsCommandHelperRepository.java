// package com.soccer.fut7.soccer_system.team.helpers;

// import java.util.HashSet;
// import java.util.Optional;
// import java.util.Set;
// import java.util.UUID;

// import org.springframework.stereotype.Component;

// import com.soccer.fut7.soccer_system.team.entitiy.PlayerMatchStatsEntity;
// import com.soccer.fut7.soccer_system.team.repository.PlayerMatchStatsRepositoryData;

// import lombok.RequiredArgsConstructor;

// @Component
// @RequiredArgsConstructor
// public class PlayerStatsCommandHelperRepository {
//     private final PlayerMatchStatsRepositoryData playerMatchStatsRepositoryData;

//     public void updatePlayerStats(PlayerMatchStatsEntity statsRecord) {
//         playerMatchStatsRepositoryData.save(statsRecord);
//     }

//     public void deletePlayerStat(UUID playerId, UUID matchId) {
//         playerMatchStatsRepositoryData.deleteByPlayer_IdAndMatch_Id(playerId, matchId);
//     }

//     public void deleteAllUserStatsFromMatch(UUID matchId) {
//         playerMatchStatsRepositoryData.deleteByMatch_Id(matchId);
//     }

//     public void deleteUserStatFromMatch(UUID matchId, UUID userId) {
//         playerMatchStatsRepositoryData.deleteByMatch_IdAndPlayer_Id(matchId, userId);
//     }

//     public Optional<PlayerMatchStatsEntity> updateOrCreatePlayerStatsFromMatch(PlayerMatchStatsEntity statsRecord) {
//         Optional<PlayerMatchStatsEntity> existingStats = playerMatchStatsRepositoryData
//             .findByPlayer_IdAndMatch_Id(statsRecord.getPlayer().getId(), statsRecord.getMatch().getId());

//         if (existingStats.isPresent()) {
//             PlayerMatchStatsEntity existingEntity = existingStats.get();
//             existingEntity.setGoals(statsRecord.getGoals());
//             existingEntity.setPoints(statsRecord.getPoints());
//             existingEntity.setAttended(statsRecord.getAttended());
//             existingEntity.setYellowCards(statsRecord.getYellowCards());
//             existingEntity.setRedCards(statsRecord.getRedCards());
//             return Optional.of(playerMatchStatsRepositoryData.save(existingEntity));
//         } else {
//             return Optional.of(playerMatchStatsRepositoryData.save(statsRecord));
//         }
//     }

//     public Optional<Set<PlayerMatchStatsEntity>> updateOrCreatePlayerStatsFromMatchBatch(Set<PlayerMatchStatsEntity> statsRecords) {
//         Set<PlayerMatchStatsEntity> updatedEntities = new HashSet<>();
        
//         for (PlayerMatchStatsEntity statsRecord : statsRecords) {
//             Optional<PlayerMatchStatsEntity> updatedEntity = updateOrCreatePlayerStatsFromMatch(statsRecord);
//             updatedEntity.ifPresent(updatedEntities::add);
//         }
        
//         return Optional.of(updatedEntities);
//     }
// }