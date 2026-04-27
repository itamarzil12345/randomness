import { API_BASE_URL } from "../constants";
import type { Enrichment, EnrichmentScraper } from "../types/enrichment";
import { requestJson } from "./http";

const url = (personId: string): string =>
  `${API_BASE_URL}/people/${personId}/enrichments`;

export const fetchEnrichmentsApi = (personId: string): Promise<Enrichment[]> =>
  requestJson(url(personId));

export const saveEnrichmentApi = (
  personId: string,
  scraper: EnrichmentScraper,
  payload: unknown,
): Promise<Enrichment> =>
  requestJson(url(personId), {
    method: "POST",
    body: { scraper, payload },
  });
