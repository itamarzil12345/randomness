import type { Person } from "../types/person";

export type ScraperId = "wikipedia" | "github" | "duckduckgo" | "google";

export type WikipediaPart = {
  title: string;
  description: string | null;
  extract: string | null;
  thumbnail: string | null;
  pageUrl: string | null;
  wikidataId: string | null;
  occupation: string[];
  birthDate: string | null;
  birthPlace: string | null;
  nationality: string[];
  gender: "male" | "female" | "other" | null;
  rawDob: { year: number; month: number; day: number } | null;
};

export type GitHubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  publicRepos: number | null;
  followers: number | null;
};

export type DuckDuckGoHit = {
  abstract: string;
  abstractSource: string | null;
  abstractUrl: string | null;
};

export type GoogleHit = {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  thumbnail: string | null;
};

export type WikiPersonResult = {
  query: string;
  wikipedia: WikipediaPart | null;
  github: GitHubUser[];
  duckDuckGo: DuckDuckGoHit | null;
  google: GoogleHit[] | null;
};

export type ScraperConfig = {
  enabled: ScraperId[];
  googleApiKey?: string;
  googleCseId?: string;
};

export const SCRAPER_DEFINITIONS: Array<{
  id: ScraperId;
  label: string;
  source: string;
  description: string;
  requiresKey?: boolean;
}> = [
  {
    id: "wikipedia",
    label: "Wikipedia + Wikidata",
    source: "en.wikipedia.org",
    description: "Top-hit summary, Wikidata claims (occupation, birth, nationality).",
  },
  {
    id: "github",
    label: "GitHub",
    source: "api.github.com",
    description: "User search with bio, location, repos, followers.",
  },
  {
    id: "duckduckgo",
    label: "DuckDuckGo",
    source: "api.duckduckgo.com",
    description: "Instant Answer abstract from the open web.",
  },
  {
    id: "google",
    label: "Google Custom Search",
    source: "customsearch.googleapis.com",
    description: "Programmable Search results. Requires API key + CSE ID.",
    requiresKey: true,
  },
];

type WikiOpenSearch = [string, string[], string[], string[]];

type WikipediaSummary = {
  title: string;
  description?: string;
  extract?: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
  content_urls?: { desktop?: { page: string } };
  wikibase_item?: string;
  type?: string;
};

type WikidataEntity = {
  claims?: Record<
    string,
    Array<{
      mainsnak?: {
        datavalue?:
          | { type: "wikibase-entityid"; value: { id: string } }
          | { type: "time"; value: { time: string } }
          | { type: "string"; value: string }
          | { type: string; value: unknown };
      };
    }>
  >;
};

type WbEntities = {
  entities?: Record<string, WikidataEntity & { labels?: Record<string, { value: string }> }>;
};

type GitHubSearchItem = {
  login: string;
  avatar_url: string;
  html_url: string;
};

type GitHubSearchResponse = {
  items?: GitHubSearchItem[];
};

type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number | null;
  followers: number | null;
};

type DuckDuckGoResponse = {
  Abstract?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
};

type GoogleResponse = {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    displayLink?: string;
    pagemap?: {
      cse_thumbnail?: Array<{ src?: string }>;
      cse_image?: Array<{ src?: string }>;
    };
  }>;
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const fetchWikipediaTopHit = async (query: string): Promise<string | null> => {
  const search = await fetchJson<WikiOpenSearch>(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`,
  );
  if (!search || !search[1] || search[1].length === 0) return null;
  return search[1][0];
};

const fetchWikipediaSummary = async (title: string): Promise<WikipediaSummary | null> =>
  fetchJson<WikipediaSummary>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );

const fetchWikidataEntity = async (qid: string): Promise<WikidataEntity | null> => {
  const json = await fetchJson<{ entities?: Record<string, WikidataEntity> }>(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
  );
  return json?.entities?.[qid] ?? null;
};

const fetchWikidataLabels = async (qids: string[]): Promise<Record<string, string>> => {
  if (qids.length === 0) return {};
  const json = await fetchJson<WbEntities>(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en&props=labels&origin=*&ids=${qids.join("|")}`,
  );
  const out: Record<string, string> = {};
  for (const [id, entity] of Object.entries(json?.entities ?? {})) {
    const label = entity.labels?.en?.value;
    if (label) out[id] = label;
  }
  return out;
};

const idsFromClaim = (entity: WikidataEntity, prop: string): string[] => {
  const claims = entity.claims?.[prop] ?? [];
  const ids: string[] = [];
  for (const claim of claims) {
    const v = claim.mainsnak?.datavalue;
    if (v && v.type === "wikibase-entityid" && v.value && typeof v.value === "object") {
      ids.push((v.value as { id: string }).id);
    }
  }
  return ids;
};

const timeFromClaim = (entity: WikidataEntity, prop: string): string | null => {
  const claims = entity.claims?.[prop] ?? [];
  for (const claim of claims) {
    const v = claim.mainsnak?.datavalue;
    if (v && v.type === "time") {
      return (v.value as { time: string }).time;
    }
  }
  return null;
};

const parseWikiTime = (raw: string | null): {
  iso: string | null;
  parts: { year: number; month: number; day: number } | null;
} => {
  if (!raw) return { iso: null, parts: null };
  const m = raw.match(/^([+-]?\d+)-(\d{2})-(\d{2})/);
  if (!m) return { iso: null, parts: null };
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return { iso: null, parts: null };
  }
  const safeMonth = Math.max(1, month);
  const safeDay = Math.max(1, day);
  const iso = `${String(year).padStart(4, "0")}-${String(safeMonth).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
  return { iso, parts: { year, month: safeMonth, day: safeDay } };
};

const runWikipediaPipeline = async (query: string): Promise<WikipediaPart | null> => {
  const title = await fetchWikipediaTopHit(query);
  if (!title) return null;
  const summary = await fetchWikipediaSummary(title);
  if (!summary || summary.type === "disambiguation") return null;

  const wikidataId = summary.wikibase_item ?? null;
  let occupationIds: string[] = [];
  let nationalityIds: string[] = [];
  let birthPlaceIds: string[] = [];
  let genderIds: string[] = [];
  let rawDob: WikipediaPart["rawDob"] = null;
  let birthDate: string | null = null;

  if (wikidataId) {
    const entity = await fetchWikidataEntity(wikidataId);
    if (entity) {
      occupationIds = idsFromClaim(entity, "P106");
      nationalityIds = idsFromClaim(entity, "P27");
      birthPlaceIds = idsFromClaim(entity, "P19");
      genderIds = idsFromClaim(entity, "P21");
      const dob = timeFromClaim(entity, "P569");
      const parsed = parseWikiTime(dob);
      birthDate = parsed.iso;
      rawDob = parsed.parts;
    }
  }

  const labels = await fetchWikidataLabels([
    ...occupationIds.slice(0, 4),
    ...nationalityIds.slice(0, 2),
    ...birthPlaceIds.slice(0, 1),
    ...genderIds.slice(0, 1),
  ]);

  const occupation = occupationIds.slice(0, 4).map((id) => labels[id]).filter(Boolean);
  const nationality = nationalityIds.slice(0, 2).map((id) => labels[id]).filter(Boolean);
  const birthPlace = birthPlaceIds[0] ? labels[birthPlaceIds[0]] ?? null : null;
  const genderLabel = genderIds[0] ? labels[genderIds[0]]?.toLowerCase() ?? null : null;
  let gender: WikipediaPart["gender"] = null;
  if (genderLabel === "male" || genderLabel === "female") gender = genderLabel;
  else if (genderLabel) gender = "other";

  return {
    title: summary.title,
    description: summary.description ?? null,
    extract: summary.extract ?? null,
    thumbnail: summary.originalimage?.source ?? summary.thumbnail?.source ?? null,
    pageUrl: summary.content_urls?.desktop?.page ?? null,
    wikidataId,
    occupation,
    birthDate,
    birthPlace,
    nationality,
    gender,
    rawDob,
  };
};

const runGithubPipeline = async (query: string): Promise<GitHubUser[]> => {
  const search = await fetchJson<GitHubSearchResponse>(
    `https://api.github.com/search/users?q=${encodeURIComponent(query)}+in:name+in:login&per_page=3`,
  );
  const items = search?.items ?? [];
  if (items.length === 0) return [];

  const top = items[0];
  const detail = await fetchJson<GitHubUserResponse>(
    `https://api.github.com/users/${encodeURIComponent(top.login)}`,
  );
  const headUser: GitHubUser = detail
    ? {
        login: detail.login,
        name: detail.name,
        avatarUrl: detail.avatar_url,
        htmlUrl: detail.html_url,
        bio: detail.bio,
        location: detail.location,
        company: detail.company,
        publicRepos: detail.public_repos,
        followers: detail.followers,
      }
    : {
        login: top.login,
        name: null,
        avatarUrl: top.avatar_url,
        htmlUrl: top.html_url,
        bio: null,
        location: null,
        company: null,
        publicRepos: null,
        followers: null,
      };

  const tail: GitHubUser[] = items.slice(1).map((item) => ({
    login: item.login,
    name: null,
    avatarUrl: item.avatar_url,
    htmlUrl: item.html_url,
    bio: null,
    location: null,
    company: null,
    publicRepos: null,
    followers: null,
  }));

  return [headUser, ...tail];
};

const runDuckDuckGoPipeline = async (query: string): Promise<DuckDuckGoHit | null> => {
  const data = await fetchJson<DuckDuckGoResponse>(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`,
  );
  if (!data) return null;
  const abstract = data.Abstract?.trim();
  if (!abstract) return null;
  return {
    abstract,
    abstractSource: data.AbstractSource ?? null,
    abstractUrl: data.AbstractURL ?? null,
  };
};

const runGooglePipeline = async (
  query: string,
  apiKey: string,
  cseId: string,
): Promise<GoogleHit[]> => {
  const trimmedKey = apiKey.trim();
  const trimmedCse = cseId.trim();
  if (!trimmedKey || !trimmedCse) {
    throw new Error(
      "Google scraper needs an API key and CSE ID. Configure them above to enable.",
    );
  }
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(trimmedKey)}&cx=${encodeURIComponent(trimmedCse)}&q=${encodeURIComponent(query)}&num=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Custom Search failed (${response.status})`);
  }
  const data = (await response.json()) as GoogleResponse;
  const items = data.items ?? [];
  return items
    .filter((item) => item.link && item.title)
    .map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      snippet: item.snippet ?? "",
      displayLink: item.displayLink ?? "",
      thumbnail:
        item.pagemap?.cse_thumbnail?.[0]?.src ??
        item.pagemap?.cse_image?.[0]?.src ??
        null,
    }));
};

export const runWikiPersonScraper = async (
  query: string,
  config: ScraperConfig,
): Promise<WikiPersonResult> => {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw new Error("Query is empty.");
  }
  const enabled = new Set(config.enabled);
  if (enabled.size === 0) {
    throw new Error("All scrapers are disabled. Enable at least one to search.");
  }

  const wikipediaPromise = enabled.has("wikipedia")
    ? runWikipediaPipeline(trimmed).catch(() => null)
    : Promise.resolve(null);
  const githubPromise = enabled.has("github")
    ? runGithubPipeline(trimmed).catch(() => [] as GitHubUser[])
    : Promise.resolve([] as GitHubUser[]);
  const duckPromise = enabled.has("duckduckgo")
    ? runDuckDuckGoPipeline(trimmed).catch(() => null)
    : Promise.resolve(null);
  const googlePromise = enabled.has("google")
    ? runGooglePipeline(trimmed, config.googleApiKey ?? "", config.googleCseId ?? "").catch(
        () => null,
      )
    : Promise.resolve(null);

  const [wikipedia, github, duckDuckGo, google] = await Promise.all([
    wikipediaPromise,
    githubPromise,
    duckPromise,
    googlePromise,
  ]);

  const hasAnyData =
    wikipedia !== null ||
    github.length > 0 ||
    duckDuckGo !== null ||
    (google && google.length > 0);

  if (!hasAnyData) {
    const sources = Array.from(enabled).join(", ");
    throw new Error(`No public footprint detected via ${sources} for this query.`);
  }

  return { query: trimmed, wikipedia, github, duckDuckGo, google };
};

const computeAge = (parts: { year: number; month: number; day: number } | null): number => {
  if (!parts) return 0;
  const now = new Date();
  let age = now.getFullYear() - parts.year;
  const m = now.getMonth() + 1 - parts.month;
  if (m < 0 || (m === 0 && now.getDate() < parts.day)) age -= 1;
  return Math.max(0, age);
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fallbackPicture = (seed: string): string =>
  `https://api.dicebear.com/9.x/personas/png?seed=${encodeURIComponent(seed)}`;

export const buildPersonFromWikiResult = (result: WikiPersonResult): Person => {
  const wiki = result.wikipedia;
  const headGithub = result.github[0] ?? null;
  const headGoogle = result.google?.[0] ?? null;

  const fullTitle =
    wiki?.title ??
    headGithub?.name ??
    headGithub?.login ??
    headGoogle?.title ??
    result.query;
  const parts = fullTitle.trim().split(/\s+/);
  const first = parts[0] ?? "Unknown";
  const last = parts.slice(1).join(" ") || "—";
  const slug = slugify(fullTitle) || "subject";
  const picture =
    wiki?.thumbnail ??
    headGithub?.avatarUrl ??
    headGoogle?.thumbnail ??
    fallbackPicture(fullTitle);

  const id =
    wiki?.wikidataId ??
    (headGithub ? `gh-${headGithub.login}` : null) ??
    `wiki-${slug}`;

  const country =
    wiki?.nationality[0] ??
    wiki?.birthPlace ??
    headGithub?.location ??
    "Unknown";

  return {
    id,
    source: "saved",
    gender: wiki?.gender ?? "unknown",
    name: { title: "—", first, last },
    email: `${slug}@scrawler.local`,
    phone: "—",
    picture: { thumbnail: picture, large: picture },
    location: {
      country,
      streetNumber: 0,
      streetName: "—",
      city: wiki?.birthPlace ?? headGithub?.location ?? "—",
      state: "—",
    },
    dob: {
      age: computeAge(wiki?.rawDob ?? null),
      date: wiki?.birthDate ?? new Date().toISOString().slice(0, 10),
    },
  };
};
