// File: src/app/features/category/category-types.ts

/**
 * Interface for age range data structure
 */
export interface AgeRangeRecord {
    minAge: number;
    maxAge: number;
  }
  
  /**
   * Interface for category information record
   */
  export interface CategoryInfoRecord {
    id: string;
    name: string;
    imageUrl: string;
    ageRange: AgeRangeRecord;
  }
  
  /**
   * Type for category validation errors
   */
  export type CategoryValidationErrors = {
    [key in keyof CategoryInfoRecord]?: string[];
  };