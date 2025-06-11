import {
  dataTeam,
  InfoPlayerForm,
  // ROLE,
  StateType,
} from "@/components/PlayerManagment/index";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

interface CardsState {
  numberOfCards: number;
  counts: Record<StateType, number>;
  forms: InfoPlayerForm[];
  beggininState: InfoPlayerForm[];
  dataTeam: dataTeam;
  beggininTeam: dataTeam;
  chages: number;
  currentModalKey: string | null; // Track which player's modal is open
  loading: boolean;
  error: string | null;
  captionSelected: boolean;
}

// Load state from localStorage or return default state
const loadStateFromLocalStorage = (): CardsState => {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  const defaultState = getDefaultState();

  return {
    currentModalKey: localStorage.getItem("currentModalKey")
      ? JSON.parse(localStorage.getItem("currentModalKey")!)
      : defaultState.currentModalKey,
    captionSelected: localStorage.getItem("captionSelected")
      ? JSON.parse(localStorage.getItem("captionSelected")!)
      : defaultState.captionSelected,
    chages: localStorage.getItem("changes")
      ? JSON.parse(localStorage.getItem("changes")!)
      : defaultState.chages,
    numberOfCards: localStorage.getItem("numberOfCards")
      ? JSON.parse(localStorage.getItem("numberOfCards")!)
      : defaultState.numberOfCards,
    counts: localStorage.getItem("counts")
      ? JSON.parse(localStorage.getItem("counts")!)
      : defaultState.counts,
    forms: localStorage.getItem("forms")
      ? JSON.parse(localStorage.getItem("forms")!)
      : defaultState.forms,
    beggininState: localStorage.getItem("begininState")
      ? JSON.parse(localStorage.getItem("begininState")!)
      : defaultState.beggininState,
    dataTeam: localStorage.getItem("dataTeam")
      ? JSON.parse(localStorage.getItem("dataTeam")!)
      : defaultState.dataTeam,
    beggininTeam: localStorage.getItem("begininTeam")
      ? JSON.parse(localStorage.getItem("begininTeam")!)
      : defaultState.beggininTeam,
    loading: false,

    error: null,
  };
};

const getDefaultState = (): CardsState => ({
  chages: 0,
  numberOfCards: 0,
  counts: { empty: 0, media: 0, filled: 0 },
  forms: [],
  captionSelected: false,
  beggininState: [],
  dataTeam: {
    id: "",
    name: "",
    categoryId: "",
    numMembers: 0,
    goals: 0,
    goalsReceived: 0,
    points: 0,
    matches: 0,
    logo: "",
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    qualified: false,
  },
  currentModalKey: null, // No modal open by default
  loading: false,
  beggininTeam: {
    id: "",
    name: "",
    categoryId: "",
    numMembers: 0,
    goals: 0,
    goalsReceived: 0,
    points: 0,
    matches: 0,
    logo: "",
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    qualified: false,
  },
  error: null,
});

// Async thunk for saving player data
export const savePlayer = createAsyncThunk(
  "cards/savePlayer",
  async (playerData: InfoPlayerForm) => {
    // Here you would typically make an API call
    // For now, we'll just simulate it
    return new Promise<InfoPlayerForm>((resolve) => {
      setTimeout(() => {
        resolve(playerData);
      }, 500);
    });
  }
);

// Async thunk for deleting player
export const deletePlayer = createAsyncThunk(
  "cards/deletePlayer",
  async (playerKey: string) => {
    // Simulate API call
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(playerKey);
      }, 500);
    });
  }
);

const cardsSlice = createSlice({
  name: "cards",
  initialState: loadStateFromLocalStorage(),
  reducers: {
    // Clear all state and localStorage
    clearState: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("changes");
        localStorage.removeItem("numberOfCards");
        localStorage.removeItem("counts");
        localStorage.removeItem("forms");
        localStorage.removeItem("begininState");
        localStorage.removeItem("dataTeam");
        localStorage.removeItem("begininTeam");
        localStorage.removeItem("currentModalKey");
        localStorage.removeItem("errorsDataTeam");
      }
      return getDefaultState();
    },

    // Set which player's modal is currently open
    setCurrentModalKey: (state, action: PayloadAction<string | null>) => {
      state.currentModalKey = action.payload;
      localStorage.setItem("currentModalKey", JSON.stringify(action.payload));
    },

    setCaptionSelected: (state, action: PayloadAction<boolean>) => {
      state.captionSelected = action.payload;
      localStorage.setItem("captionSelected", JSON.stringify(action.payload));
    },

    // Sync actions
    setNumberOfCards: (state, action: PayloadAction<number>) => {
      state.numberOfCards = action.payload;
      localStorage.setItem("numberOfCards", JSON.stringify(action.payload));
    },

    setTeamData: (state, action: PayloadAction<dataTeam>) => {
      state.dataTeam = action.payload;
      localStorage.setItem("dataTeam", JSON.stringify(action.payload));
    },
    setBeginnninTeam: (state, action: PayloadAction<dataTeam>) => {
      state.beggininTeam = action.payload;
      localStorage.setItem("begininTeam", JSON.stringify(action.payload));
    },

    setCurrentTempData: (state, action: PayloadAction<dataTeam>) => {
      state.dataTeam = { ...state.dataTeam, ...action.payload };
      localStorage.setItem("dataTeam", JSON.stringify(state.dataTeam));
    },

    setChages: (state, action: PayloadAction<number>) => {
      state.chages = state.chages + action.payload;
      localStorage.setItem("changes", JSON.stringify(state.chages));
    },

    setCounts: (state, action: PayloadAction<Record<StateType, number>>) => {
      state.counts = action.payload;
      localStorage.setItem("counts", JSON.stringify(action.payload));
    },

    setForms: (state, action: PayloadAction<InfoPlayerForm[]>) => {
      if (!isEqual(state.forms, action.payload)) {
        state.forms = action.payload;
        localStorage.setItem("forms", JSON.stringify(action.payload));
      }
    },

    setBeginninState: (state, action: PayloadAction<InfoPlayerForm[]>) => {
      if (!isEqual(state.beggininState, action.payload)) {
        state.beggininState = action.payload;
        localStorage.setItem("begininState", JSON.stringify(action.payload));
      }
    },

    addForm: (state, action: PayloadAction<InfoPlayerForm>) => {
      state.forms.push(action.payload);
      // state.counts[action.payload.type] += 1;
      state.numberOfCards += 1;
      persistState(state);
    },

    // Direct form deletion (sync version)
    deleteForm: (state, action: PayloadAction<string>) => {
      const formIndex = state.forms.findIndex(
        (form) => form.playerId === action.payload
      );
      if (formIndex >= 0) {
        // const formType = state.forms[formIndex].type;
        state.forms.splice(formIndex, 1);
        // state.counts[formType] -= 1;
        state.numberOfCards -= 1;

        if (state.currentModalKey === action.payload) {
          state.currentModalKey = null;
        }

        if (state.numberOfCards === 0) {
          state.counts = { empty: 0, media: 0, filled: 0 };
          state.currentModalKey = null;
        }

        persistState(state);
      }
    },
    replaceForm: (state, action: PayloadAction<InfoPlayerForm>) => {
      console.log("Formsjsiojhoijh:", action.payload);
      console.log("Replacing form with key:", action.payload.playerId);
      const index = state.forms.findIndex(
        (form) => form.playerId === action.payload.playerId
      );
      console.log("Index:", index);

      if (index !== -1) {
        state.forms[index] = action.payload;
        persistState(state);
      } else {
        // Si no existe, lo agregamos (por si acaso)
        state.forms.push(action.payload);
        // state.counts[action.payload.type] += 1;
        state.numberOfCards += 1;

        persistState(state);
      }
    },

    updateForm: (
      state,
      action: PayloadAction<{
        key: string;
        field: keyof InfoPlayerForm;
        value: string | number;
      }>
    ) => {
      const { key, field, value } = action.payload;
      const formToUpdate = state.forms.find((form) => form.playerId === key);
      if (!formToUpdate) return;

      switch (field) {
        case "firstName":
        case "lastName":
        case "email":
        case "photoUrl":
        case "birthDate":
        case "teamName":
          formToUpdate[field] = String(value);
          break;

        case "age":
        case "jerseyNumber":
        case "goals":
        case "points":
        case "yellowCards":
        case "redCards":
          formToUpdate[field] = isNaN(Number(value)) ? 0 : Number(value);
          break;
        case "playerStatus":
          formToUpdate[field] = String(value);
          break;

        case "captain":
          formToUpdate[field] = Boolean(value);
          break;

        case "teamId":
          formToUpdate[field] = String(value);
          break;
        // case "role":
        //   if (["ADMINISTRADOR", "PLAYER", "USER", "ARBITRO"].includes(String(value))) {
        //     formToUpdate.role = value as typeof formToUpdate.role;
        //   } else {
        //     console.warn(`Invalid role: ${value}`);
        //   }
        //   break;

        // case "status":
        //   if (["ACTIVO", "INACTIVO", "SUSPENDIDO"].includes(String(value))) {
        //     formToUpdate.status = value as typeof formToUpdate.status;
        //   } else {
        //     console.warn(`Invalid status: ${value}`);
        //   }
        //   break;

        // case "type":
        //   if (["empty", "media", "filled"].includes(String(value))) {
        //     formToUpdate.type = value as typeof formToUpdate.type;
        //   } else {
        //     console.warn(`Invalid type: ${value}`);
        //   }
        //   break;

        default:
          console.warn(`Unsupported field: ${field}`);
      }

      localStorage.setItem("forms", JSON.stringify(state.forms));
    },

    // Direct form submission (sync version)
    submitForm: (state, action: PayloadAction<InfoPlayerForm>) => {
      const index = state.forms.findIndex(
        (f) => f.playerId === action.payload.playerId
      );
      if (index >= 0) {
        // const oldType = state.forms[index].type;
        // const newType = action.payload.type;

        state.forms[index] = action.payload;

        // if (oldType !== newType) {
        //   state.counts[oldType] -= 1;
        //   state.counts[newType] += 1;
        // }
      } else {
        // state.forms.push(action.payload);
        // state.counts[action.payload.type] += 1;
        state.numberOfCards += 1;
      }
      persistState(state);
    },

    generateInitialForms: (state, action: PayloadAction<number>) => {
      const numberOfCards = action.payload;
      const newForms: InfoPlayerForm[] = Array.from(
        { length: numberOfCards },
        () => ({
          playerId: "",
          firstName: "",
          lastName: "",
          email: "",
          age: 0,
          photoUrl: "",
          birthDate: new Date().toISOString().split("T")[0], // format to YYYY-MM-DD
          jerseyNumber: 0,
          goals: 0,
          points: 0,
          yellowCards: 0,
          redCards: 0,
          playerStatus: "",
          captain: false,
          teamId: "",
          teamName: "",
        })
      );
      state.forms = newForms;
      state.counts = { empty: numberOfCards, media: 0, filled: 0 };
      state.numberOfCards = numberOfCards;
    },
  },

  extraReducers: (builder) => {
    builder
      // Save player async handlers
      .addCase(savePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePlayer.fulfilled, (state, action) => {
        const index = state.forms.findIndex(
          (f) => f.playerId === action.payload.playerId
        );
        if (index >= 0) {
          // const oldType = state.forms[index].type;
          // const newType = action.payload.type;

          state.forms[index] = action.payload;

          // if (oldType !== newType) {
          //   state.counts[oldType] -= 1;
          //   state.counts[newType] += 1;
          // }
        } else {
          // state.forms.push(action.payload);
          // state.counts[action.payload.type] += 1;
          state.numberOfCards += 1;
        }
        state.loading = false;
        persistState(state);
      })
      .addCase(savePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save player";
      })

      // Delete player async handlers
      .addCase(deletePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlayer.fulfilled, (state, action) => {
        const formIndex = state.forms.findIndex(
          (form) => form.playerId === action.payload
        );
        if (formIndex >= 0) {
          // const formType = state.forms[formIndex].type;
          state.forms.splice(formIndex, 1);
          // state.counts[formType] -= 1;
          state.numberOfCards -= 1;

          if (state.currentModalKey === action.payload) {
            state.currentModalKey = null;
          }

          if (state.numberOfCards === 0) {
            state.counts = { empty: 0, media: 0, filled: 0 };
            state.currentModalKey = null;
          }
        }
        state.loading = false;
        persistState(state);
      })
      .addCase(deletePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete player";
      });
  },
});

// Helper function to persist all state to localStorage
function persistState(state: CardsState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("forms", JSON.stringify(state.forms));
    localStorage.setItem("counts", JSON.stringify(state.counts));
    localStorage.setItem("numberOfCards", JSON.stringify(state.numberOfCards));
    localStorage.setItem(
      "currentModalKey",
      JSON.stringify(state.currentModalKey)
    );
  }
}

export const {
  setNumberOfCards,
  setCounts,
  replaceForm,
  setForms,
  addForm,
  deleteForm,
  updateForm,
  submitForm,
  generateInitialForms,

  clearState,
  setTeamData,
  setCurrentTempData,
  setChages,
  setBeginnninTeam,
  setBeginninState,
  setCurrentModalKey,
} = cardsSlice.actions;

export default cardsSlice;
