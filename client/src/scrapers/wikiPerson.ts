import type { Person } from "../types/person";

export type WikiPersonResult = {
  query: string;
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

const fetchWikipediaSummary = async (query: string): Promise<WikipediaSummary | null> => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as WikipediaSummary;
  } catch {
    return null;
  }
};

const fetchWikidataEntity = async (qid: string): Promise<WikidataEntity | null> => {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = (await response.json()) as { entities?: Record<string, WikidataEntity> };
    return json.entities?.[qid] ?? null;
  } catch {
    return null;
  }
};

const fetchWikidataLabels = async (qids: string[]): Promise<Record<string, string>> => {
  if (qids.length === 0) return {};
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en&props=labels&origin=*&ids=${qids.join("|")}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return {};
    const json = (await response.json()) as WbEntities;
    const out: Record<string, string> = {};
    for (const [id, entity] of Object.entries(json.entities ?? {})) {
      const label = entity.labels?.en?.value;
      if (label) out[id] = label;
    }
    return out;
  } catch {
    return {};
  }
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

export const runWikiPersonScraper = async (query: string): Promise<WikiPersonResult> => {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw new Error("Query is empty.");
  }

  const summary = await fetchWikipediaSummary(trimmed);
  if (!summary) {
    throw new Error("No Wikipedia entry found for this query.");
  }

  const wikidataId = summary.wikibase_item ?? null;
  let occupationIds: string[] = [];
  let nationalityIds: string[] = [];
  let birthPlaceIds: string[] = [];
  let genderIds: string[] = [];
  let rawDob: WikiPersonResult["rawDob"] = null;
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
  let gender: WikiPersonResult["gender"] = null;
  if (genderLabel === "male" || genderLabel === "female") gender = genderLabel;
  else if (genderLabel) gender = "other";

  return {
    query: trimmed,
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

export const buildPersonFromWikiResult = (
  result: WikiPersonResult,
): Person => {
  const parts = result.title.trim().split(/\s+/);
  const first = parts[0] ?? "Unknown";
  const last = parts.slice(1).join(" ") || "—";
  const slug = slugify(result.title) || "subject";
  const picture =
    result.thumbnail ?? fallbackPicture(result.title || "subject");

  return {
    id: result.wikidataId ?? `wiki-${slug}`,
    source: "saved",
    gender: result.gender ?? "unknown",
    name: { title: "—", first, last },
    email: `${slug}@scrawler.local`,
    phone: "—",
    picture: { thumbnail: picture, large: picture },
    location: {
      country: result.nationality[0] ?? result.birthPlace ?? "Unknown",
      streetNumber: 0,
      streetName: "—",
      city: result.birthPlace ?? "—",
      state: "—",
    },
    dob: {
      age: computeAge(result.rawDob),
      date: result.birthDate ?? new Date().toISOString().slice(0, 10),
    },
  };
};
