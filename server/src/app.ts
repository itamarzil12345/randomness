import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import {
  API_PREFIX,
  CHROME_DEVTOOLS_PATH,
  CLIENT_URL,
  HttpStatus,
} from "./constants.js";
import { connectionRouter } from "./routes/connectionRoutes.js";
import { peopleRouter } from "./routes/peopleRoutes.js";
import { settingsRouter } from "./routes/settingsRoutes.js";
import { NotFoundError } from "./utils/errors.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.redirect(CLIENT_URL);
});

app.get(CHROME_DEVTOOLS_PATH, (_request, response) => {
  response.status(HttpStatus.noContent).send();
});

app.get(`${API_PREFIX}/health`, (_request, response) => {
  response.status(HttpStatus.ok).json({ status: "ok" });
});

app.use(`${API_PREFIX}/people`, peopleRouter);
app.use(`${API_PREFIX}/connections`, connectionRouter);
app.use(`${API_PREFIX}/settings`, settingsRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(HttpStatus.badRequest).json({ message: "Invalid request" });
    return;
  }

  if (error instanceof NotFoundError) {
    response.status(HttpStatus.notFound).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(HttpStatus.serverError).json({ message: "Server error" });
};

app.use(errorHandler);
