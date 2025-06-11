// File: src/app/features/tournament/utils/tournament-utils.ts

// Phase mapping - Backend phase names to display names
const phaseMapping: Record<string, string> = {
  "ROUND_ROBIN": "Group Stage",
  "DIVISION_PHASE": "Division Phase",
  "CUARTOS_PRIMERA": "Quarter Finals - Primera",
  "SEMIFINAL_PRIMERA": "Semi Finals - Primera",
  "FINAL_PRIMERA": "Finals - Primera",
  "TERCER_LUGAR_PRIMERA": "Third Place - Primera",
  "CUARTOS_SEGUNDA": "Quarter Finals - Segunda",
  "SEMIFINAL_SEGUNDA": "Semi Finals - Segunda",
  "FINAL_SEGUNDA": "Finals - Segunda",
  "TERCER_LUGAR_SEGUNDA": "Third Place - Segunda"
};

/**
 * Helper function to get display name for phase
 */
export const getPhaseDisplayName = (phase: string): string => {
  return phaseMapping[phase] || phase;
};

/**
 * Get phase progression order based on division name
 */
export const getPhaseOrder = (divisionName: string): string[] => {
  return divisionName === "PRIMERA" 
    ? ["ROUND_ROBIN", "DIVISION_PHASE", "CUARTOS_PRIMERA", "SEMIFINAL_PRIMERA", "FINAL_PRIMERA", "TERCER_LUGAR_PRIMERA"] 
    : ["ROUND_ROBIN", "DIVISION_PHASE", "CUARTOS_SEGUNDA", "SEMIFINAL_SEGUNDA", "FINAL_SEGUNDA", "TERCER_LUGAR_SEGUNDA"];
};

/**
 * Get accumulated phases up to current phase
 */
export const getAccumulatedPhases = (currentPhase: string, divisionName: string): string[] => {
  const phaseOrder = getPhaseOrder(divisionName);
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
  
  if (currentPhaseIndex >= 0) {
    return phaseOrder.slice(0, currentPhaseIndex + 1);
  } else {
    return [currentPhase]; // If phase not in predefined order, just show current
  }
};

/**
 * Create tournament info object
 */
export const createTournamentInfo = (
  categoryId: string,
  categoryName: string
): Omit<import('../types/tournament-types').TournamentInfoRecord, 'id'> => {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30); // Set end date to 30 days from now
  
  return {
    tournamentName: `Tournament ${categoryName} ${today.toLocaleDateString()}`,
    categoryId,
    categoryName,
    startDate: today.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};