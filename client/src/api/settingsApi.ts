import { API_BASE_URL } from "../constants";
import { requestJson } from "./http";

export type Setting = {
  key: string;
  value: string;
  updatedAt: string;
};

const baseUrl = `${API_BASE_URL}/settings`;

export const fetchSettingsApi = (): Promise<Setting[]> => requestJson(baseUrl);

export const updateSettingApi = (key: string, value: string): Promise<Setting> =>
  requestJson(`${baseUrl}/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: { value },
  });
