import type { Person } from "../types/person";
import type { GeoEnrichment } from "../types/enrichment";

type RestCountry = {
  capital?: string[];
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  flag?: string;
  flags?: { png?: string; svg?: string };
  latlng?: [number, number];
  timezones?: string[];
};

export const runGeoScraper = async (person: Person): Promise<GeoEnrichment> => {
  const country = person.location.country;
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true&fields=capital,region,subregion,population,area,languages,currencies,flag,flags,latlng,timezones`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geo lookup failed (${response.status})`);
  }
  const rows = (await response.json()) as RestCountry[];
  const data = rows[0];
  if (!data) {
    throw new Error(`No geographic data found for ${country}`);
  }

  return {
    country,
    capital: data.capital?.[0] ?? null,
    region: data.region ?? "Unknown",
    subregion: data.subregion ?? null,
    population: data.population ?? null,
    area: data.area ?? null,
    languages: data.languages ? Object.values(data.languages) : [],
    currencies: data.currencies
      ? Object.values(data.currencies).map((c) => c.name)
      : [],
    flagEmoji: data.flag ?? null,
    flagPng: data.flags?.png ?? null,
    latlng: data.latlng ?? null,
    timezones: data.timezones ?? [],
  };
};
