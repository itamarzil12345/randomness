import { configureStore } from "@reduxjs/toolkit";
import { connectionsReducer } from "../features/connections/connectionsSlice";
import { enrichmentsReducer } from "../features/enrichments/enrichmentsSlice";
import { peopleReducer } from "../features/people/peopleSlice";

export const store = configureStore({
  reducer: {
    people: peopleReducer,
    connections: connectionsReducer,
    enrichments: enrichmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
