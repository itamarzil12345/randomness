import { enrichmentRepository } from "../db/enrichmentRepository.js";
import type { Enrichment, EnrichmentInput } from "../types/enrichment.js";

export const enrichmentService = {
  list(personId: string): Promise<Enrichment[]> {
    return enrichmentRepository.listForPerson(personId);
  },

  upsert(personId: string, input: EnrichmentInput): Promise<Enrichment> {
    return enrichmentRepository.upsert(personId, input);
  },

  deleteByPerson(personId: string): Promise<void> {
    return enrichmentRepository.deleteByPerson(personId);
  },
};
