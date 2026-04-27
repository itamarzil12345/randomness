import { randomUUID } from "node:crypto";
import type { Enrichment, EnrichmentInput } from "../types/enrichment.js";
import { enrichmentEntity, type StoredEnrichment } from "./enrichmentEntity.js";
import { getDataSource } from "./dataSource.js";

const toApi = (stored: StoredEnrichment): Enrichment => ({
  id: stored.id,
  personId: stored.personId,
  scraper: stored.scraper as Enrichment["scraper"],
  payload: JSON.parse(stored.payloadJson) as unknown,
  runAt: stored.runAt.toISOString(),
});

const getRepository = async () => {
  const dataSource = await getDataSource();
  return dataSource.getRepository(enrichmentEntity);
};

export const enrichmentRepository = {
  async listForPerson(personId: string): Promise<Enrichment[]> {
    const repository = await getRepository();
    const stored = await repository.find({ where: { personId } });
    return stored.map(toApi);
  },

  async upsert(personId: string, input: EnrichmentInput): Promise<Enrichment> {
    const repository = await getRepository();
    const existing = await repository.findOne({
      where: { personId, scraper: input.scraper },
    });

    if (existing) {
      existing.payloadJson = JSON.stringify(input.payload);
      existing.runAt = new Date();
      await repository.save(existing);
      return toApi(existing);
    }

    const stored: StoredEnrichment = {
      id: randomUUID(),
      personId,
      scraper: input.scraper,
      payloadJson: JSON.stringify(input.payload),
      runAt: new Date(),
    };
    await repository.save(stored);
    return toApi(stored);
  },

  async deleteByPerson(personId: string): Promise<void> {
    const repository = await getRepository();
    await repository.delete({ personId });
  },
};
