import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit"; //
// import { localStorageMiddleware } from "./middleware"; // Adjust the import path as needed
import cardsReducer from "./feature/Card/cardSlice";
// import userSlice from "./feature/User/userSlice";
import matchesSlice from "./feature/Matches/matchSlice";
import WeeksSlice from "./feature/Matches/WeekSlice";
// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.

// here i combinin' all reducers to the correspondin' slice
const rootReducer = combineSlices(cardsReducer, matchesSlice, WeeksSlice);
// Infer the `RootState` type from the root reducer Solution: Use the Slice Object Instead of the Reducer
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
/*Why is this important?

If a single Redux store instance were shared across multiple requests, data from one user's session could inadvertently affect another's, leading to potential security issues and inconsistent application behavior. By generating a unique store for each request, we ensure that each user's data remains private and that the application's state is consistent and predictable. */
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools:true,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.

    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat();
    },
  });
};

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
