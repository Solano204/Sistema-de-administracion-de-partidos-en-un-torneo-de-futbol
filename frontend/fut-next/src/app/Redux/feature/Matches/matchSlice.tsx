import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Match, week } from "@/app/(HeroSection)/agenda/types/TypesAgend";

export interface matchState {
  match: Match;
}

export interface initialState {
  matches: week[]; // arrays of the items already chose
  choseMatches: Match[]; // arrays of the items in general
}

// Helper function to load state from localStorage 
const loadStateFromLocalStorage = (): initialState => {
  if (typeof window === "undefined") {
    return { matches: [], choseMatches: [] };
  }
  const storedState = localStorage.getItem("matchesState");
  return storedState
    ? JSON.parse(storedState)
    : { matches: [], choseMatches: [] };
};

// Helper function to save state to localStorage
const saveStateToLocalStorage = (state: initialState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("matchesState", JSON.stringify(state));
};

// Initial state loaded from localStorage
const initialState: initialState = loadStateFromLocalStorage();

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    // Add a new match to the state
    addMatch(state, action: PayloadAction<week>) {
      // Check if match already exists with same id, day and hour
      const exists = state.matches.some(m => 
        m.match.id === action.payload.match.id
      );
      
      if (!exists) {
        state.matches.push(action.payload);
        saveStateToLocalStorage(state);
      } else {
        console.warn('Duplicate match detected:', action.payload);
        // Optionally update the existing match instead
        // const index = state.matches.findIndex(m => 
        //   m.match.id === action.payload.match.id && 
        //   m.day === action.payload.day && 
        //   m.hour === action.payload.hour
        // );
        // if (index !== -1) {
        //   state.matches[index] = action.payload;
        //   saveStateToLocalStorage(state);
        // }
      }
    },
    syncWithSchedule(state, action: PayloadAction<week[]>) {
      const scheduledMatches = action.payload.map(w => w.match);
      state.choseMatches = [...state.choseMatches, ...scheduledMatches];
      saveStateToLocalStorage(state);
    }
    ,
    // Update an existing match in the state
    updateMatch(state, action: PayloadAction<week>) {
      const index = state.matches.findIndex(
        (match) =>
          match.match.id === action.payload.match.id
      );
      if (index !== -1) {
        state.matches[index] = action.payload; // Update the match
        saveStateToLocalStorage(state); // Sync with localStorage
      }
    },
    // Remove a match from the state
   
    removeMatchId(state, action: PayloadAction<{ id: string }>) {
      state.matches = state.matches.filter(
        (match) =>
          match.match.id !== action.payload.id
      );
      saveStateToLocalStorage(state); // Sync with localStorage
    },
    // Reset the state to its initial value and clear localStorage
    resetMatches(state) {
      state.matches = [];
      // state.choseMatches = [];
      localStorage.removeItem("matchesState");
    },
    // Initialize a new state from scratch
    initMatches(state, action: PayloadAction<week[]>) {
      state.matches = action.payload;
      saveStateToLocalStorage(state);
    },

    // Add a match to `choseMatches`
    addChoseMatch(state, action: PayloadAction<Match>) {
      state.choseMatches.push(action.payload);
      saveStateToLocalStorage(state);
    },
    // Remove a match from `choseMatches`
    removeChoseMatch(state, action: PayloadAction<string>) {
      state.choseMatches = state.choseMatches.filter(
        (match) => match.id !== action.payload
      );
      saveStateToLocalStorage(state);
    },
    // Update a match in `choseMatches`
    updateChoseMatch(state, action: PayloadAction<Match>) {
      const index = state.choseMatches.findIndex(
        (match) => match.id === action.payload.id
      );
      if (index !== -1) {
        state.choseMatches[index] = action.payload; // Update the match
        saveStateToLocalStorage(state); // Sync with localStorage
      }
    },
    updateAllChoseMatches(state, action: PayloadAction<Match[]>) {
      state.choseMatches = action.payload;
      saveStateToLocalStorage(state);
    },
    // Reset `choseMatches`
    resetChoseMatches(state) {
      state.choseMatches = [];
      saveStateToLocalStorage(state);
    },
  },
});

export const {
  addMatch,
  updateMatch,
  removeMatchId,
  resetMatches,
  initMatches,
  addChoseMatch,
  removeChoseMatch,
  updateChoseMatch,
  resetChoseMatches,
  updateAllChoseMatches
} = matchesSlice.actions;

export default matchesSlice;