export type statusMatch = "PENDIENTE" | "POSPONIDO" | "SELECIONADO" | "JUGADO" | "CANCELADO";
export type categories = "FEMENINIL" | "SUB-20" | "SUB-23" | "SUB-26";
export type phases= "CUARTOS" | "SEMIFINAL" | "TERCER-PUESTO" | "FINAL";
export type divisions= "PRIMERA" | "SEGUNDA";
export type Match = {
    id: string;
    team1: string;
    team2: string;
    tourmentId: string;
    tournamentName: string;
    status: statusMatch;
    phase?: string;
    category: string;
};


export type week = {
    date: string; // Changed from Date to string
    day: string;
    hour: string;
    match: Match;
  }