import type { Person, ProfileSourceType } from "../types/person";
import { toFullName } from "./person";

export type SortBy = "name" | "age" | "country" | "recent";
export type SortDir = "asc" | "desc";
export type SourceMode = "all" | "random" | "saved";
export type TriState = "any" | "yes" | "no";

export type PeopleFiltersState = {
  query: string;
  countries: string[];
  cities: string[];
  genders: string[];
  ageRange: [number, number];
  hasPhone: TriState;
  source: SourceMode;
  sortBy: SortBy;
  sortDir: SortDir;
};

export const DEFAULT_AGE_RANGE: [number, number] = [0, 100];

export const defaultFilters = (): PeopleFiltersState => ({
  query: "",
  countries: [],
  cities: [],
  genders: [],
  ageRange: [...DEFAULT_AGE_RANGE] as [number, number],
  hasPhone: "any",
  source: "all",
  sortBy: "name",
  sortDir: "asc",
});

export const isFilterActive = (filters: PeopleFiltersState): boolean => {
  return (
    filters.query.trim().length > 0 ||
    filters.countries.length > 0 ||
    filters.cities.length > 0 ||
    filters.genders.length > 0 ||
    filters.ageRange[0] !== DEFAULT_AGE_RANGE[0] ||
    filters.ageRange[1] !== DEFAULT_AGE_RANGE[1] ||
    filters.hasPhone !== "any" ||
    filters.source !== "all"
  );
};

const matchesQuery = (person: Person, query: string): boolean => {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    toFullName(person.name),
    person.email,
    person.phone,
    person.location.city,
    person.location.country,
    person.location.state,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

const looksMissing = (value: string): boolean => {
  const trimmed = (value ?? "").trim();
  return trimmed.length === 0 || trimmed === "—" || trimmed === "-";
};

export const applyPeopleFilters = (
  people: Person[],
  filters: PeopleFiltersState,
  sourceContext?: ProfileSourceType,
): Person[] => {
  const filtered = people.filter((person) => {
    if (!matchesQuery(person, filters.query)) return false;
    if (filters.countries.length > 0 && !filters.countries.includes(person.location.country))
      return false;
    if (filters.cities.length > 0 && !filters.cities.includes(person.location.city)) return false;
    if (filters.genders.length > 0 && !filters.genders.includes(person.gender)) return false;
    if (person.dob.age < filters.ageRange[0] || person.dob.age > filters.ageRange[1])
      return false;
    if (filters.hasPhone === "yes" && looksMissing(person.phone)) return false;
    if (filters.hasPhone === "no" && !looksMissing(person.phone)) return false;
    if (sourceContext !== "saved") {
      if (filters.source === "random" && person.source !== "random") return false;
      if (filters.source === "saved" && person.source !== "saved") return false;
    }
    return true;
  });

  const compare = (a: Person, b: Person): number => {
    let v = 0;
    if (filters.sortBy === "name") v = toFullName(a.name).localeCompare(toFullName(b.name));
    else if (filters.sortBy === "age") v = a.dob.age - b.dob.age;
    else if (filters.sortBy === "country")
      v = a.location.country.localeCompare(b.location.country);
    else if (filters.sortBy === "recent") {
      const aw = a.source === "saved" ? 1 : 0;
      const bw = b.source === "saved" ? 1 : 0;
      v = bw - aw;
      if (v === 0) v = toFullName(a.name).localeCompare(toFullName(b.name));
    }
    return filters.sortDir === "asc" ? v : -v;
  };

  return [...filtered].sort(compare);
};

export const collectFacetValues = (
  people: Person[],
): { countries: string[]; cities: string[]; genders: string[] } => {
  const countries = new Set<string>();
  const cities = new Set<string>();
  const genders = new Set<string>();
  for (const person of people) {
    if (person.location.country) countries.add(person.location.country);
    if (person.location.city) cities.add(person.location.city);
    if (person.gender) genders.add(person.gender);
  }
  return {
    countries: Array.from(countries).sort((a, b) => a.localeCompare(b)),
    cities: Array.from(cities).sort((a, b) => a.localeCompare(b)),
    genders: Array.from(genders).sort((a, b) => a.localeCompare(b)),
  };
};
