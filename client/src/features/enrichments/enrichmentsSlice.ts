import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchEnrichmentsApi, saveEnrichmentApi } from "../../api/enrichmentsApi";
import type { Enrichment, EnrichmentScraper } from "../../types/enrichment";

type EnrichmentsState = {
  byPerson: Record<string, Enrichment[]>;
  loadingPersonId: string | null;
  runningScraper: Record<string, EnrichmentScraper | null>;
};

const initialState: EnrichmentsState = {
  byPerson: {},
  loadingPersonId: null,
  runningScraper: {},
};

export const fetchEnrichments = createAsyncThunk(
  "enrichments/fetch",
  async (personId: string) => {
    const list = await fetchEnrichmentsApi(personId);
    return { personId, list };
  },
);

export const saveEnrichment = createAsyncThunk(
  "enrichments/save",
  async (args: { personId: string; scraper: EnrichmentScraper; payload: unknown }) => {
    const enrichment = await saveEnrichmentApi(args.personId, args.scraper, args.payload);
    return enrichment;
  },
);

const enrichmentsSlice = createSlice({
  name: "enrichments",
  initialState,
  reducers: {
    setRunningScraper(state, action: { payload: { personId: string; scraper: EnrichmentScraper | null } }) {
      state.runningScraper[action.payload.personId] = action.payload.scraper;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrichments.pending, (state, action) => {
        state.loadingPersonId = action.meta.arg;
      })
      .addCase(fetchEnrichments.fulfilled, (state, action) => {
        state.loadingPersonId = null;
        state.byPerson[action.payload.personId] = action.payload.list;
      })
      .addCase(fetchEnrichments.rejected, (state) => {
        state.loadingPersonId = null;
      })
      .addCase(saveEnrichment.fulfilled, (state, action) => {
        const list = state.byPerson[action.payload.personId] ?? [];
        const next = list.filter((item) => item.scraper !== action.payload.scraper);
        next.push(action.payload);
        state.byPerson[action.payload.personId] = next;
      });
  },
});

export const { setRunningScraper } = enrichmentsSlice.actions;
export const enrichmentsReducer = enrichmentsSlice.reducer;
