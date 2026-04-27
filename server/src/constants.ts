export const SERVER_PORT = 4000;
export const CLIENT_URL = "http://localhost:5173";
export const DATA_DIRECTORY = "data";
export const PEOPLE_FILE = "people.json";
export const API_PREFIX = "/api";
export const CHROME_DEVTOOLS_PATH =
  "/.well-known/appspecific/com.chrome.devtools.json";

export const HttpStatus = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const;
