import type { Person } from "../types/person";

const STORAGE_KEY = "people:randomState";

export type PersistedRandomState = {
  randomPeople: Person[];
  randomPage: number;
  randomSeed: string;
};

export const loadRandomState = (): PersistedRandomState | undefined => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as PersistedRandomState;
    if (!Array.isArray(parsed.randomPeople)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
};

export const saveRandomState = (state: PersistedRandomState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors
  }
};
