import {
  API_BASE_URL,
  RANDOM_USER_API_URL,
  RANDOM_USER_PAGE_SIZE,
} from "../constants";
import type { Person, PersonName, RandomUserResponse } from "../types/person";
import { mapRandomUser } from "../utils/person";
import { requestJson } from "./http";

const peopleUrl = `${API_BASE_URL}/people`;

export type FetchRandomPeopleArgs = {
  page: number;
  seed: string;
  pageSize?: number;
  baseUrl?: string;
};

export const fetchRandomPeoplePageApi = async ({
  page,
  seed,
  pageSize = RANDOM_USER_PAGE_SIZE,
  baseUrl = RANDOM_USER_API_URL,
}: FetchRandomPeopleArgs): Promise<Person[]> => {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const url = `${baseUrl}${separator}results=${pageSize}&page=${page}&seed=${encodeURIComponent(seed)}`;
  const data = await requestJson<RandomUserResponse>(url);
  return data.results.map(mapRandomUser);
};

export const fetchSavedPeopleApi = (): Promise<Person[]> => {
  return requestJson<Person[]>(peopleUrl);
};

export const savePersonApi = (person: Person): Promise<Person> => {
  return requestJson<Person>(peopleUrl, {
    method: "POST",
    body: person,
  });
};

export const updateSavedPersonApi = (
  id: string,
  name: PersonName,
): Promise<Person> => {
  return requestJson<Person>(`${peopleUrl}/${id}`, {
    method: "PATCH",
    body: { name },
  });
};

export const deleteSavedPersonApi = (id: string): Promise<void> => {
  return requestJson<void>(`${peopleUrl}/${id}`, { method: "DELETE" });
};
