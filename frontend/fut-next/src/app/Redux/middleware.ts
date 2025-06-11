// // src/store/middleware/localStorageMiddleware.ts
// import { Middleware } from "@reduxjs/toolkit";
// import { RootState } from "./store"; // Adjust the import path as needed

// // THIS MIDDLEAWRE WIL BE EXECUTED AFTER THE SLICE WAS UPDATED TO GET THE CURRENT STORE AND STATE AND MODIFY THE LOCAL STORAGE AFTER THE SLICE IS UPDATIN OR RESTART BUT THIS MIDDLEWARE ALREADY SAVE THE DATA IN LOCAL STORAGE AND WHEN THE SLICE INIT AGAIN WILL USE THE METHOD TO GET THE DATA FROM THE LOCALSTORAGE
// export const localStorageMiddleware: Middleware<{}, RootState> =
//   (store) => (next) => (action) => {
//     const result = next(action); // Let the action update the state first

//     // Get the updated state
//     const state = store.getState().cards;

//     // Save the relevant parts of the state to localStorage
//     localStorage.setItem("numberOfCards", JSON.stringify(state.numberOfCards));
//     localStorage.setItem("counts", JSON.stringify(state.counts));
//     localStorage.setItem("forms", JSON.stringify(state.forms));
//     localStorage.setItem("dataTeam", JSON.stringify(state.dataTeam));

//     // Define the URL pattern to match
//     const urlPattern = /^\/Categories\/SUB21\/teams\/[^/]+$/;

//     // Check if the current URL matches the pattern
//     if (!urlPattern.test(window.location.pathname)) {
//       // Remove specific items from localStorage
//       localStorage.removeItem("numberOfCards");
//       localStorage.removeItem("counts");
//       localStorage.removeItem("forms");
//       localStorage.removeItem("dataTeam");

//     }

//     return result; // Return the result of the action
//   };