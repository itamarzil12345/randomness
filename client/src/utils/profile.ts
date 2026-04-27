import type { Person } from "../types/person";
import { getBirthYear } from "./person";

export const findPerson = (
  source: string | undefined,
  id: string | undefined,
  randomPeople: Person[],
  savedPeople: Person[],
): Person | undefined => {
  const people = source === "saved" ? savedPeople : randomPeople;
  return people.find((person) => person.id === id);
};

export const getProfileItems = (
  person: Person,
): Array<{ label: string; value: string | number }> => [
  { label: "Gender", value: person.gender },
  { label: "Age", value: person.dob.age },
  { label: "Birth year", value: getBirthYear(person.dob.date) },
  {
    label: "Street",
    value: `${person.location.streetNumber} ${person.location.streetName}`,
  },
  { label: "City", value: person.location.city },
  { label: "State", value: person.location.state },
  { label: "Country", value: person.location.country },
  { label: "Phone", value: person.phone },
];
