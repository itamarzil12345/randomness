import { z } from "zod";

export const connectionInputSchema = z.object({
  sourceId: z.string().trim().min(1),
  targetId: z.string().trim().min(1),
  kind: z.enum(["shared_country", "same_age_band", "associate", "co_signal"]),
  label: z.string().trim().min(1).max(120),
  weight: z.number().min(0).max(1).optional(),
});
