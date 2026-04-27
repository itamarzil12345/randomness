import { Router } from "express";
import { HttpStatus } from "../constants.js";
import { settingsService } from "../services/settingsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { settingValueSchema } from "../validation/settingSchemas.js";

export const settingsRouter = Router();

settingsRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const list = await settingsService.list();
    response.status(HttpStatus.ok).json(list);
  }),
);

settingsRouter.get(
  "/:key",
  asyncHandler(async (request, response) => {
    const setting = await settingsService.get(request.params.key);
    response.status(HttpStatus.ok).json(setting);
  }),
);

settingsRouter.put(
  "/:key",
  asyncHandler(async (request, response) => {
    const { value } = settingValueSchema.parse(request.body);
    const updated = await settingsService.set(request.params.key, value);
    response.status(HttpStatus.ok).json(updated);
  }),
);
