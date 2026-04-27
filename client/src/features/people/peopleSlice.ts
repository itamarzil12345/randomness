import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  deleteSavedPersonApi,
  fetchRandomPeopleApi,
  fetchSavedPeopleApi,
  savePersonApi,
  updateSavedPersonApi,
} from "../../api/peopleApi";
import type { Person, PersonName } from "../../types/person";

type LoadingKey = "random" | "saved" | "mutation";

type PeopleState = {
  randomPeople: Person[];
  savedPeople: Person[];
  loading: Record<LoadingKey, boolean>;
  error: string | null;
};

const initialState: PeopleState = {
  randomPeople: [],
  savedPeople: [],
  loading: {
    random: false,
    saved: false,
    mutation: false,
  },
  error: null,
};

export const fetchRandomPeople = createAsyncThunk(
  "people/fetchRandom",
  fetchRandomPeopleApi,
);

export const fetchSavedPeople = createAsyncThunk(
  "people/fetchSaved",
  fetchSavedPeopleApi,
);

export const savePerson = createAsyncThunk("people/save", savePersonApi);

export const updateSavedPerson = createAsyncThunk(
  "people/updateSaved",
  ({ id, name }: { id: string; name: PersonName }) =>
    updateSavedPersonApi(id, name),
);

export const deleteSavedPerson = createAsyncThunk(
  "people/deleteSaved",
  async (id: string) => {
    await deleteSavedPersonApi(id);
    return id;
  },
);

const setPending = (state: PeopleState, key: LoadingKey): void => {
  state.loading[key] = true;
  state.error = null;
};

const setRejected = (state: PeopleState, key: LoadingKey): void => {
  state.loading[key] = false;
  state.error = "Something went wrong. Please try again.";
};

const updatePersonName = (
  people: Person[],
  id: string,
  name: PersonName,
): void => {
  const person = people.find((item) => item.id === id);

  if (person) {
    person.name = name;
  }
};

const peopleSlice = createSlice({
  name: "people",
  initialState,
  reducers: {
    updateRandomPersonName(
      state,
      action: PayloadAction<{ id: string; name: PersonName }>,
    ) {
      updatePersonName(state.randomPeople, action.payload.id, action.payload.name);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomPeople.pending, (state) => setPending(state, "random"))
      .addCase(fetchRandomPeople.fulfilled, (state, action) => {
        state.loading.random = false;
        state.randomPeople = action.payload;
      })
      .addCase(fetchRandomPeople.rejected, (state) => setRejected(state, "random"))
      .addCase(fetchSavedPeople.pending, (state) => setPending(state, "saved"))
      .addCase(fetchSavedPeople.fulfilled, (state, action) => {
        state.loading.saved = false;
        state.savedPeople = action.payload;
      })
      .addCase(fetchSavedPeople.rejected, (state) => setRejected(state, "saved"))
      .addCase(savePerson.pending, (state) => setPending(state, "mutation"))
      .addCase(savePerson.fulfilled, (state, action) => {
        state.loading.mutation = false;
        updatePersonName(state.randomPeople, action.payload.id, action.payload.name);
        state.savedPeople = [
          ...state.savedPeople.filter((person) => person.id !== action.payload.id),
          action.payload,
        ];
      })
      .addCase(savePerson.rejected, (state) => setRejected(state, "mutation"))
      .addCase(updateSavedPerson.pending, (state) => setPending(state, "mutation"))
      .addCase(updateSavedPerson.fulfilled, (state, action) => {
        state.loading.mutation = false;
        updatePersonName(state.savedPeople, action.payload.id, action.payload.name);
      })
      .addCase(updateSavedPerson.rejected, (state) => setRejected(state, "mutation"))
      .addCase(deleteSavedPerson.pending, (state) => setPending(state, "mutation"))
      .addCase(deleteSavedPerson.fulfilled, (state, action) => {
        state.loading.mutation = false;
        state.savedPeople = state.savedPeople.filter(
          (person) => person.id !== action.payload,
        );
      })
      .addCase(deleteSavedPerson.rejected, (state) => setRejected(state, "mutation"));
  },
});

export const { updateRandomPersonName } = peopleSlice.actions;
export const peopleReducer = peopleSlice.reducer;
