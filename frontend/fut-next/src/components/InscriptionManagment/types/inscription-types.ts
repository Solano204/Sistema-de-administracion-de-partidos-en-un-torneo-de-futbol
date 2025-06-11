// File: src/app/features/inscription/types/inscription-types.ts

/**
 * Interface for inscription record data
 */
export interface InscriptionInfoRecord {
    id: string;
    nameTeam: string;
    numPlayer: number;
    date: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Interface for team summary (similar to player summary)
 */
export interface TeamSummaryRecord {
    id: string;
    name: string;
    playerCount: number;
}

/**
 * Type for inscription validation errors
 */
export type InscriptionValidationErrors = {
    [key in keyof InscriptionInfoRecord]?: string[];
};