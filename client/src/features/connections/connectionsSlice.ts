import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createConnectionApi,
  deleteConnectionApi,
  fetchConnectionsApi,
  synthesizeConnectionsApi,
} from "../../api/connectionsApi";
import type { Connection, ConnectionInput } from "../../types/connection";

type ConnectionsState = {
  connections: Connection[];
  loading: boolean;
  error: string | null;
};

const initialState: ConnectionsState = {
  connections: [],
  loading: false,
  error: null,
};

export const fetchConnections = createAsyncThunk("connections/fetch", fetchConnectionsApi);

export const synthesizeConnections = createAsyncThunk(
  "connections/synthesize",
  synthesizeConnectionsApi,
);

export const createConnection = createAsyncThunk(
  "connections/create",
  (input: ConnectionInput) => createConnectionApi(input),
);

export const deleteConnection = createAsyncThunk(
  "connections/delete",
  async (id: string) => {
    await deleteConnectionApi(id);
    return id;
  },
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load connections.";
      })
      .addCase(synthesizeConnections.fulfilled, (state, action) => {
        state.connections = action.payload;
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload);
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter((c) => c.id !== action.payload);
      });
  },
});

export const connectionsReducer = connectionsSlice.reducer;
