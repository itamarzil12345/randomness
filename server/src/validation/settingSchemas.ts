import { z } from "zod";

export const settingValueSchema = z.object({
  value: z.string().max(2048),
});
