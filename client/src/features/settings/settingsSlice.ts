import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchSettingsApi,
  updateSettingApi,
  type Setting,
} from "../../api/settingsApi";

export const RANDOM_USER_API_KEY = "randomUserApiUrl";
export const DEFAULT_RANDOM_USER_API_URL = "https://randomuser.me/api/";

type SettingsState = {
  byKey: Record<string, string>;
  loaded: boolean;
};

const initialState: SettingsState = {
  byKey: {
    [RANDOM_USER_API_KEY]: DEFAULT_RANDOM_USER_API_URL,
  },
  loaded: false,
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
