import { z } from "zod";

export const settingValueSchema = z.object({
  value: z.string().trim().min(1).max(2048),
});
