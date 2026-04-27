import { Router } from "express";
import { HttpStatus } from "../constants.js";
import { enrichmentService } from "../services/enrichmentService.js";
import { peopleService } from "../services/peopleService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enrichmentInputSchema } from "../validation/enrichmentSchemas.js";
import { personSchema, updateNameSchema } from "../validation/personSchemas.js";

export const peopleRouter = Router();

peopleRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const people = await peopleService.list();
    response.status(HttpStatus.ok).json(people);
  }),
);

peopleRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const person = personSchema.parse(request.body);
    const savedPerson = await peopleService.save(person);
    response.status(HttpStatus.created).json(savedPerson);
  }),
);

peopleRouter.patch(
  "/:id",
  asyncHandler(async (request, response) => {
    const { name } = updateNameSchema.parse(request.body);
    const person = await peopleService.updateName(request.params.id, name);
    response.status(HttpStatus.ok).json(person);
  }),
);

peopleRouter.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    await peopleService.delete(request.params.id);
    response.status(HttpStatus.noContent).send();
  }),
);

peopleRouter.get(
  "/:id/enrichments",
  asyncHandler(async (request, response) => {
    const enrichments = await enrichmentService.list(request.params.id);
    response.status(HttpStatus.ok).json(enrichments);
  }),
);

peopleRouter.post(
  "/:id/enrichments",
  asyncHandler(async (request, response) => {
    const input = enrichmentInputSchema.parse(request.body);
    const enrichment = await enrichmentService.upsert(request.params.id, {
      scraper: input.scraper,
      payload: input.payload ?? null,
    });
    response.status(HttpStatus.ok).json(enrichment);
  }),
);
