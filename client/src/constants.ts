export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const RANDOM_USER_API_URL = "https://randomuser.me/api/";
export const RANDOM_USER_PAGE_SIZE = 10;
export const MAX_RANDOM_USERS = 100;

export const AppRoute = {
  home: "/",
  randomPeople: "/",
  savedPeople: "/saved",
  graph: "/graph",
  profile: "/profile/:source/:id",
} as const;

export const APP_BRAND = {
  shortName: "PIP",
  fullName: "People Intelligence Platform",
} as const;

export const ProfileSource = {
  random: "random",
  saved: "saved",
} as const;

export const EMPTY_FILTER_VALUE = "";
export const PROFILE_ORIGIN_PARAM = "from";
