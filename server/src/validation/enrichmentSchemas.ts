import { z } from "zod";

export const enrichmentInputSchema = z.object({
  scraper: z.enum(["geo", "identity", "email"]),
  payload: z.unknown(),
});
