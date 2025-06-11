// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Match } from "@/app/utils/Types/TypesAgend";
// import { use } from "react";

// export interface UserSession {
//   name: string;
//   lastName: string;
//   photo: string;
// }

// export interface initialState {
//   userSession: UserSession;
// }

// // Helper function to load state from localStorage
// const loadStateFromLocalStorage = (): initialState => {
//   if (typeof window === "undefined") {
//     return { userSession: { name: "", lastName: "", photo: "" } };
//   }
//   const storedState = localStorage.getItem("userSession");
//   return storedState
//     ? JSON.parse(storedState)
//     : { userSession: { name: "", lastName: "", photo: "" } };
// };

// // Helper function to save state to localStorage
// const saveStateToLocalStorage = (state: initialState) => {
//   if (typeof window === "undefined") return;
//   localStorage.setItem("userSession", JSON.stringify(state));
// };

// // Initial state loaded from localStorage
// const initialState: initialState = loadStateFromLocalStorage();

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUserSession: (state, action: PayloadAction<UserSession>) => {
//       state.userSession = action.payload;
//       saveStateToLocalStorage(state);
//     },
//   }, 
// });


// export const { setUserSession } = userSlice.actions;
// export default userSlice;