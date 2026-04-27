import { settingRepository } from "../db/settingRepository.js";

const DEFAULTS: Record<string, string> = {
  randomUserApiUrl: "https://randomuser.me/api/",
};

export type Setting = {
  key: string;
  value: string;
  updatedAt: string;
};

const toApi = (stored: { key: string; value: string; updatedAt: Date }): Setting => ({
  key: stored.key,
  value: stored.value,
  updatedAt: stored.updatedAt.toISOString(),
});

export const settingsService = {
  async list(): Promise<Setting[]> {
    const stored = await settingRepository.list();
    const map = new Map(stored.map((s) => [s.key, s] as const));
    for (const [key, value] of Object.entries(DEFAULTS)) {
      if (!map.has(key)) {
        const created = await settingRepository.upsert(key, value);
        map.set(key, created);
      }
    }
    return Array.from(map.values()).map(toApi);
  },

  async get(key: string): Promise<Setting> {
    const stored = await settingRepository.get(key);
    if (stored) return toApi(stored);
    const fallback = DEFAULTS[key];
    if (fallback != null) {
      const created = await settingRepository.upsert(key, fallback);
      return toApi(created);
    }
    return { key, value: "", updatedAt: new Date().toISOString() };
  },

  async set(key: string, value: string): Promise<Setting> {
    const stored = await settingRepository.upsert(key, value);
    return toApi(stored);
  },
};
