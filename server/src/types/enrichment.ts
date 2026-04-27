export type EnrichmentScraper = "geo" | "identity" | "email";

export type Enrichment = {
  id: string;
  personId: string;
  scraper: EnrichmentScraper;
  payload: unknown;
  runAt: string;
};

export type EnrichmentInput = {
  scraper: EnrichmentScraper;
  payload: unknown;
};
