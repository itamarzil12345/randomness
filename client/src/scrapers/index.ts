import type { Person } from "../types/person";
import type {
  EmailEnrichment,
  EnrichmentScraper,
  GeoEnrichment,
  IdentityEnrichment,
} from "../types/enrichment";
import { runGeoScraper } from "./geo";
import { runIdentityScraper } from "./identity";
import { runEmailScraper } from "./email";

export type ScraperPayload = {
  geo: GeoEnrichment;
  identity: IdentityEnrichment;
  email: EmailEnrichment;
};

export type ScraperDefinition = {
  id: EnrichmentScraper;
  label: string;
  description: string;
  source: string;
  run: (person: Person) => Promise<unknown>;
};

export const scrapers: ScraperDefinition[] = [
  {
    id: "geo",
    label: "Geo Lookup",
    source: "restcountries.com",
    description:
      "Resolves the subject's reported country to authoritative geographic, demographic, and territorial data.",
    run: runGeoScraper,
  },
  {
    id: "identity",
    label: "Identity Cross-check",
    source: "genderize · agify",
    description:
      "Cross-references the subject's reported gender and age against name-based statistical models to score self-claim consistency.",
    run: runIdentityScraper,
  },
  {
    id: "email",
    label: "Email Signal",
    source: "kickbox · format",
    description:
      "Validates email format and checks the domain against a disposable-address registry for risk signals.",
    run: runEmailScraper,
  },
];

export const scraperById = (id: EnrichmentScraper): ScraperDefinition | undefined =>
  scrapers.find((s) => s.id === id);
