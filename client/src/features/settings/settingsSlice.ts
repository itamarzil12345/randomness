import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchSettingsApi,
  updateSettingApi,
  type Setting,
} from "../../api/settingsApi";

export const RANDOM_USER_API_KEY = "randomUserApiUrl";
export const DEFAULT_RANDOM_USER_API_URL = "https://randomuser.me/api/";
export const ENABLED_SCRAPERS_KEY = "enabledScrapers";
export const GOOGLE_API_KEY = "googleApiKey";
export const GOOGLE_CSE_ID_KEY = "googleCseId";
export const DEFAULT_ENABLED_SCRAPERS = ["wikipedia", "github", "duckduckgo"];

type SettingsState = {
  byKey: Record<string, string>;
  loaded: boolean;
};

const initialState: SettingsState = {
  byKey: {
    [RANDOM_USER_API_KEY]: DEFAULT_RANDOM_USER_API_URL,
    [ENABLED_SCRAPERS_KEY]: JSON.stringify(DEFAULT_ENABLED_SCRAPERS),
    [GOOGLE_API_KEY]: "",
    [GOOGLE_CSE_ID_KEY]: "",
  },
  loaded: false,
};

export const parseEnabledScrapers = (raw: string | undefined): string[] => {
  if (!raw) return DEFAULT_ENABLED_SCRAPERS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // ignore
  }
  return DEFAULT_ENABLED_SCRAPERS;
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  fetchSettingsApi,
);

export const updateSetting = createAsyncThunk(
  "settings/update",
  ({ key, value }: { key: string; value: string }) => updateSettingApi(key, value),
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loaded = true;
        for (const setting of action.payload as Setting[]) {
          state.byKey[setting.key] = setting.value;
        }
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.byKey[action.payload.key] = action.payload.value;
      });
  },
});

export const settingsReducer = settingsSlice.reducer;
