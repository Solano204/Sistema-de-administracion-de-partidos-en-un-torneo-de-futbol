// WeeksSlice.ts - Updated to handle match IDs for deletion
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  week } from "@/app/(HeroSection)/agenda/types/TypesAgend";

// Slice State interface
interface WeeksState {
  weeks: week[];
  matchesToDelete: string[]; // Changed from week[] to string[]
}

// LocalStorage Helpers
const loadFromLocalStorage = (): WeeksState => {
  if (typeof window === "undefined") return { weeks: [], matchesToDelete: [] };
  try {
    const saved = localStorage.getItem("weeksState");
    return saved ? JSON.parse(saved) : { weeks: [], matchesToDelete: [] };
  } catch (error) {
    console.error("Error loading weeks from localStorage:", error);
    return { weeks: [], matchesToDelete: [] };
  }
};

const saveToLocalStorage = (state: WeeksState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("weeksState", JSON.stringify(state));
  } catch (error) {
    console.error("Error saving weeks to localStorage:", error);
  }
};

// Initial State
const initialState: WeeksState = loadFromLocalStorage();

const weeksSlice = createSlice({
  name: "weekMatches",
  initialState,
  reducers: {
    // Existing week management reducers
    addWeek(state, action: PayloadAction<week>) {
      const existingIndex = state.weeks.findIndex(
        w => w.day === action.payload.day && 
             w.hour === action.payload.hour &&
             w.date === action.payload.date
      );
      
      if (existingIndex >= 0) {
        state.weeks[existingIndex] = action.payload;
      } else {
        state.weeks.push(action.payload);
      }
      saveToLocalStorage(state);
    },
    
    updateWeek(state, action: PayloadAction<week>) {
      const index = state.weeks.findIndex(
        w => w.day === action.payload.day && 
             w.hour === action.payload.hour &&
             w.date === action.payload.date
      );
      if (index !== -1) {
        state.weeks[index] = action.payload;
        saveToLocalStorage(state);
      }
    },
    
    removeWeek(state, action: PayloadAction<{ day: string; hour: string; date: string }>) {
      state.weeks = state.weeks.filter(
        w => w.day !== action.payload.day || 
             w.hour !== action.payload.hour ||
             w.date !== action.payload.date
      );
      saveToLocalStorage(state);
    },
    
    // Updated deletion reducers
    addMatchToDeleteList(state, action: PayloadAction<string>) {
      if (!state.matchesToDelete.includes(action.payload)) {
        state.matchesToDelete.push(action.payload);
        saveToLocalStorage(state);
      }
    },
    
    removeMatchFromDeleteList(state, action: PayloadAction<string>) {
      state.matchesToDelete = state.matchesToDelete.filter(
        id => id !== action.payload
      );
      saveToLocalStorage(state);
    },
    
    clearMatchesToDelete(state) {
      state.matchesToDelete = [];
      saveToLocalStorage(state);
    },
    
    removeWeekByMatchId(state, action: PayloadAction<string>) {
      state.weeks = state.weeks.filter(w => w.match.id !== action.payload);
      saveToLocalStorage(state);
    },
    
    // Batch deletion
    deleteSelectedMatches(state) {
      state.weeks = state.weeks.filter(
        week => !state.matchesToDelete.includes(week.match.id)
      );
      state.matchesToDelete = [];
      saveToLocalStorage(state);
    },
    
    // Other existing reducers
    resetWeeks(state) {
      state.weeks = [];
      state.matchesToDelete = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("weeksState");
      }
    },
    
    initWeeks(state, action: PayloadAction<week[]>) {
      state.weeks = action.payload;
      saveToLocalStorage(state);
    },
  },
});

export const {
  addWeek,
  updateWeek,
  removeWeek,
  addMatchToDeleteList,
  removeMatchFromDeleteList,
  clearMatchesToDelete,
  deleteSelectedMatches,
  removeWeekByMatchId,
  resetWeeks,
  initWeeks,
} = weeksSlice.actions;

export default weeksSlice;