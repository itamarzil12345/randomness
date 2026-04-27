import { API_BASE_URL, RANDOM_USER_URL } from "../constants";
import type { Person, PersonName, RandomUserResponse } from "../types/person";
import { mapRandomUser } from "../utils/person";
import { requestJson } from "./http";

const peopleUrl = `${API_BASE_URL}/people`;

export const fetchRandomPeopleApi = async (): Promise<Person[]> => {
  const data = await requestJson<RandomUserResponse>(RANDOM_USER_URL);
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
