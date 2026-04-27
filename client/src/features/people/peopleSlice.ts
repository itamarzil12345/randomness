import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  deleteSavedPersonApi,
  fetchRandomPeoplePageApi,
  fetchSavedPeopleApi,
  savePersonApi,
  updateSavedPersonApi,
} from "../../api/peopleApi";
import { MAX_RANDOM_USERS, RANDOM_USER_PAGE_SIZE } from "../../constants";
import type { Person, PersonName } from "../../types/person";
import {
  DEFAULT_RANDOM_USER_API_URL,
  RANDOM_USER_API_KEY,
} from "../settings/settingsSlice";

type SettingsLikeState = {
  byKey: Record<string, string>;
};

type LoadingKey = "random" | "saved" | "mutation";

type PeopleState = {
  randomPeople: Person[];
  randomPage: number;
  randomSeed: string;
  savedPeople: Person[];
  loading: Record<LoadingKey, boolean>;
  error: string | null;
};

const makeSeed = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const initialState: PeopleState = {
  randomPeople: [],
  randomPage: 0,
  randomSeed: "",
  savedPeople: [],
  loading: {
    random: false,
    saved: false,
    mutation: false,
  },
  error: null,
};

type RandomFetchResult = {
  people: Person[];
  page: number;
  seed: string;
  reset: boolean;
};

export const fetchRandomPeople = createAsyncThunk<
  RandomFetchResult,
  { append?: boolean } | undefined,
  { state: { people: PeopleState; settings: SettingsLikeState } }
>("people/fetchRandom", async (arg, { getState }) => {
  const append = arg?.append ?? false;
  const state = getState();
  const { randomPage, randomSeed, randomPeople } = state.people;
  const baseUrl =
    state.settings?.byKey?.[RANDOM_USER_API_KEY] ?? DEFAULT_RANDOM_USER_API_URL;
  const seed = append && randomSeed ? randomSeed : makeSeed();
  const page = append ? randomPage + 1 : 1;
  const remaining = append ? MAX_RANDOM_USERS - randomPeople.length : MAX_RANDOM_USERS;
  const pageSize = Math.min(RANDOM_USER_PAGE_SIZE, Math.max(remaining, 0));

  if (pageSize === 0) {
    return { people: [], page: randomPage, seed: randomSeed, reset: false };
  }

  const people = await fetchRandomPeoplePageApi({ page, seed, pageSize, baseUrl });
  return { people, page, seed, reset: !append };
});

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
    resetRandomPeople(state) {
      state.randomPeople = [];
      state.randomPage = 0;
      state.randomSeed = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomPeople.pending, (state) => setPending(state, "random"))
      .addCase(fetchRandomPeople.fulfilled, (state, action) => {
        state.loading.random = false;
        const { people, page, seed, reset } = action.payload;
        state.randomSeed = seed;
        state.randomPage = page;
        state.randomPeople = reset ? people : [...state.randomPeople, ...people];
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

export const { updateRandomPersonName, resetRandomPeople } = peopleSlice.actions;
export const peopleReducer = peopleSlice.reducer;
