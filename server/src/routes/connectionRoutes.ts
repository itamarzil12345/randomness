import { Router } from "express";
import { HttpStatus } from "../constants.js";
import { connectionService } from "../services/connectionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { connectionInputSchema } from "../validation/connectionSchemas.js";

export const connectionRouter = Router();

connectionRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const connections = await connectionService.list();
    response.status(HttpStatus.ok).json(connections);
  }),
);

connectionRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const input = connectionInputSchema.parse(request.body);
    const connection = await connectionService.create(input);
    response.status(HttpStatus.created).json(connection);
  }),
);

connectionRouter.post(
  "/synthesize",
  asyncHandler(async (_request, response) => {
    const connections = await connectionService.synthesize();
    response.status(HttpStatus.ok).json(connections);
  }),
);

connectionRouter.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    await connectionService.delete(request.params.id);
    response.status(HttpStatus.noContent).send();
  }),
);
