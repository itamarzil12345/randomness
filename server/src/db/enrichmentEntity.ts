import { EntitySchema } from "typeorm";

export type StoredEnrichment = {
  id: string;
  personId: string;
  scraper: string;
  payloadJson: string;
  runAt: Date;
};

export const enrichmentEntity = new EntitySchema<StoredEnrichment>({
  name: "Enrichment",
  tableName: "enrichments",
  columns: {
    id: {
      type: String,
      primary: true,
    },
    personId: {
      type: String,
      name: "person_id",
    },
    scraper: {
      type: String,
    },
    payloadJson: {
      type: String,
      name: "payload_json",
    },
    runAt: {
      type: Date,
      name: "run_at",
    },
  },
});
