export type EnrichmentScraper = "geo" | "identity" | "email";

export type Enrichment<TPayload = unknown> = {
  id: string;
  personId: string;
  scraper: EnrichmentScraper;
  payload: TPayload;
  runAt: string;
};

export type GeoEnrichment = {
  country: string;
  capital: string | null;
  region: string;
  subregion: string | null;
  population: number | null;
  area: number | null;
  languages: string[];
  currencies: string[];
  flagEmoji: string | null;
  flagPng: string | null;
  latlng: [number, number] | null;
  timezones: string[];
};

export type IdentityEnrichment = {
  firstName: string;
  reportedGender: string;
  predictedGender: string | null;
  genderProbability: number | null;
  reportedAge: number;
  predictedAge: number | null;
  ageDelta: number | null;
  consistencyScore: number;
};

export type EmailEnrichment = {
  email: string;
  domain: string;
  isFormatValid: boolean;
  isDisposable: boolean | null;
  signal: "trustworthy" | "suspect" | "disposable" | "unknown";
  notes: string[];
};
