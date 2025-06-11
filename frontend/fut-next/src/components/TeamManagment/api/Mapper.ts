import { dataTeam, InfoPlayerForm } from "@/components/PlayerManagment/types/TypesPlayer";
import { PlayerCreateRecord, PlayerDetailsRecord, TeamCreateRecord, TeamDetailsRecord } from "@/components/TeamManagment/index";
import { te } from "date-fns/locale";

// Convert Redux state to API request format
export function toTeamCreateRecord(
  dataTeam: dataTeam,
  players: InfoPlayerForm[]
): TeamCreateRecord {
  return {
    id: dataTeam.id,
    name: dataTeam.name,
    categoryId: dataTeam.categoryId,
    logo: dataTeam.logo,
    players: players.map(toPlayerCreateRecord), // directly pass the function
  };
}

// Convert individual player from Redux to API format
export function toPlayerCreateRecord(player: InfoPlayerForm): PlayerCreateRecord {
  return {
    playerId: player.playerId,
    firstName: player.firstName,
    lastName: player.lastName,
    birthDate: player.birthDate,
    jerseyNumber: player.jerseyNumber,
    Age: player.age,
    photo: player.photoUrl, // Maps photoUrl -> photo
    teamId: player.teamId,
    captain: player.captain,
    email: player.email,
  };
}

// Convert API response to Redux state format
export function toDataTeam(team: TeamDetailsRecord): dataTeam {
  return {
    id: team.id,
    name: team.name,
    categoryId: team.category.id,
    numMembers: team.numberOfPlayers,
    goals: team.goalsWin.value,
    goalsReceived: team.goalsAgainst.value,
    points: team.points.value,
    matches: team.matchesPlayed,
    logo: team.logo,
    matchesWon: team.matchesWon,
    matchesDrawn: team.matchesDrawn,
    matchesLost: team.matchesLost,
    qualified: team.qualified,
    category: team.category,
  };
}

// Convert API player to Redux player format
export function toInfoPlayerForm(player: PlayerDetailsRecord): InfoPlayerForm {
  return {
    playerId: player.playerId,
    firstName: player.firstName,
    lastName: player.lastName,
    email: player.email,
    age: player.age,
    photoUrl: player.photoUrl,
    birthDate: player.birthDate,
    jerseyNumber: player.jerseyNumber,
    goals: player.goals || 0,
    points: player.points || 0,
    yellowCards: player.yellowCards,
    redCards: player.redCards,
    playerStatus: player.playerStatus,
    captain: player.captain,
    teamId: player.teamId,
    teamName: player.teamName,
  };
}











export function toTeamUpdateRecord(
    team: dataTeam,
    players: InfoPlayerForm[]
  ): TeamCreateRecord {
    return {
      id: team.id,
      name: team.name,
      categoryId: team.categoryId,
      logo: team.logo,
      players: players.map(toPlayerCreateRecord),
    };
  }
  
  // Convert Redux InfoPlayerForm to PlayerCreateRecord (for API)
  export function toPlayerUpdateRecord(player: InfoPlayerForm): PlayerCreateRecord {
    return {
      playerId: player.playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      birthDate: player.birthDate,
      jerseyNumber: player.jerseyNumber,
      Age: player.age,
      photo: player.photoUrl, // Mapping photoUrl => photo
      teamId: player.teamId,
      captain: player.captain,
      email: player.email,
    };
  }
  
  // Convert API TeamDetailsRecord to Redux dataTeam (for Redux state)
 // Convert API TeamDetailsRecord to Redux dataTeam (for Redux state)
export function toTeamDetailsRecord(
    team: dataTeam,
    players: InfoPlayerForm[]
  ): TeamDetailsRecord {
    return {
      id: team.id,
      name: team.name,
      logo: team.logo,
      category: team.category ? {
        id: team.category.id,
        name: team.category.name,
        imageUrl: team.category.imageUrl ?? "",
        ageRange: {
          minAge: team.category.ageRange.minAge,
          maxAge: team.category.ageRange.maxAge,
        },
      } : {
        id: team.categoryId,
        name: "", // You can customize default values if category is missing
        imageUrl: "",
        ageRange: { minAge: 0, maxAge: 0 }
      },
      numberOfPlayers: players.length,
      goalsWin: { value: team.goals },
      goalsAgainst: { value: team.goalsReceived },
      points: { value: team.points },
      matchesPlayed: team.matches,
      matchesWon: team.matchesWon,
      matchesDrawn: team.matchesDrawn,
      matchesLost: team.matchesLost,
      qualified: team.qualified,
    };
  }
  // Convert API PlayerDetailsRecord to Redux InfoPlayerForm (for Redux state)
  export function toInfoPlayerFormUpdate(player: PlayerDetailsRecord): InfoPlayerForm {
    return {
      playerId: player.playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      age: player.age,
      photoUrl: player.photoUrl,
      birthDate: player.birthDate,
      jerseyNumber: player.jerseyNumber,
      goals: player.goals ?? 0, // Default to 0 if undefined
      points: player.points ?? 0,
      yellowCards: player.yellowCards ?? 0,
      redCards: player.redCards ?? 0,
      playerStatus: player.playerStatus,
      captain: player.captain,
      teamId: player.teamId,
      teamName: player.teamName,
    };
}
















export const mapPlayerToCreateRecord = (player: InfoPlayerForm, idTeam:string) => ({
  playerId: player.playerId,
  firstName: player.firstName,
  lastName: player.lastName,
  email: player.email,
  Age: player.age,
  photo: player.photoUrl,
  birthDate: player.birthDate,
  jerseyNumber: player.jerseyNumber,
  playerStatus: player.playerStatus,
  captain: player.captain,
  teamId: idTeam,
  goals: player.goals,
  points: player.points,
  yellowCards: player.yellowCards,
  redCards: player.redCards,
  teamName: player.teamName,
});

export const mapPlayerToUpdateRecord = (player: InfoPlayerForm,idTeam:string) => ({
  ...mapPlayerToCreateRecord(player,idTeam),
  // Add any update-specific fields if needed
});

export const mapTeamToDetailsRecord = (team: dataTeam, logoUrl: string): TeamDetailsRecord => ({
  id: team.id,
  name: team.name,
  logo: logoUrl,
  numberOfPlayers: team.numMembers,
  matchesPlayed: team.matches,
  matchesWon: team.matchesWon,
  matchesDrawn: team.matchesDrawn,
  matchesLost: team.matchesLost,
  qualified: team.qualified,
  category: {
    id: team.categoryId,
    name: team.category?.name || "",
    imageUrl: team.category?.imageUrl || "",
    ageRange: team.category?.ageRange || { minAge: 0, maxAge: 0 }
  },
  goalsWin: { value: team.goals },
  goalsAgainst: { value: team.goalsReceived },
  points: { value: team.points }
});

export const buildRedirectUrl = () => {
  const path = window.location.pathname.split("/").slice(0, -1).join("/");
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}${path.endsWith("/") ? path : path + "/"}`;
};