export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const RANDOM_USER_URL = "https://randomuser.me/api/?results=10";

export const AppRoute = {
  home: "/",
  randomPeople: "/random",
  savedPeople: "/history",
  profile: "/profile/:source/:id",
} as const;

export const ProfileSource = {
  random: "random",
  saved: "saved",
} as const;

export const EMPTY_FILTER_VALUE = "";
export const PROFILE_ORIGIN_PARAM = "from";
