import { API_BASE_URL } from "../constants";
import type { Connection, ConnectionInput } from "../types/connection";
import { requestJson } from "./http";

const baseUrl = `${API_BASE_URL}/connections`;

export const fetchConnectionsApi = (): Promise<Connection[]> => requestJson(baseUrl);

export const createConnectionApi = (input: ConnectionInput): Promise<Connection> =>
  requestJson(baseUrl, { method: "POST", body: input });

export const synthesizeConnectionsApi = (): Promise<Connection[]> =>
  requestJson(`${baseUrl}/synthesize`, { method: "POST" });

export const deleteConnectionApi = (id: string): Promise<void> =>
  requestJson(`${baseUrl}/${id}`, { method: "DELETE" });
