import { findCityBySlug } from "@/lib/slug";

// Override for local development against a local API; defaults to production.
const API_BASE = process.env.CIVICGRID_API_BASE || "https://api.civicgrid.org";
const API_KEY = process.env.CIVICGRID_API_KEY;

export type City = {
  id: number;
  city: string;
  state_code: string;
  state_name: string;
  county: string;
  metro_area: string;
  city_type: string;
  population: number | null;
  median_household_income: number;
  median_age: number;
  land_area_sq_mi: number;
  population_density: number;
  city_budget_text: string;
  city_budget_numeric: number;
  city_hall_phone: string;
  url: string;
  leader_name: string;
  leader_title: string;
  leader_party: string;
  leader_year_elected: number;
  leader_next_election: number;
  // Verification fields (API migration 007+). Optional: older API versions
  // don't send them, and the UI must show "not available" rather than guess.
  governance_type?: string | null;
  official_leader_page?: string | null;
  leader_last_verified_at?: string | null;
  last_verified_method?: "human" | "automated" | null;
  verification_source_url?: string | null;
  last_checked_at?: string | null;
  last_check_result?: "confirmed" | "under_review" | "check_failed" | null;
  // Appointed administrator (API migration 008): town administrator, city manager.
  administrator_name?: string | null;
  administrator_title?: string | null;
};

/** The lean row the explorer and pickers need. Keeps the /api/search payload small. */
export type CitySummary = Pick<
  City,
  | "id"
  | "city"
  | "state_code"
  | "state_name"
  | "population"
  | "county"
  | "leader_name"
  | "leader_title"
  | "leader_party"
  | "leader_year_elected"
  | "governance_type"
  | "leader_last_verified_at"
  | "last_verified_method"
  | "verification_source_url"
  | "official_leader_page"
  | "last_checked_at"
  | "last_check_result"
  | "administrator_name"
  | "administrator_title"
>;

export function toSummary(c: City): CitySummary {
  return {
    id: c.id,
    city: c.city,
    state_code: c.state_code,
    state_name: c.state_name,
    population: c.population ?? null,
    county: c.county,
    leader_name: c.leader_name,
    leader_title: c.leader_title,
    leader_party: c.leader_party,
    leader_year_elected: c.leader_year_elected,
    governance_type: c.governance_type ?? null,
    leader_last_verified_at: c.leader_last_verified_at ?? null,
    last_verified_method: c.last_verified_method ?? null,
    verification_source_url: c.verification_source_url ?? null,
    official_leader_page: c.official_leader_page ?? null,
    last_checked_at: c.last_checked_at ?? null,
    last_check_result: c.last_check_result ?? null,
    administrator_name: c.administrator_name ?? null,
    administrator_title: c.administrator_title ?? null,
  };
}

/**
 * Process-level cache of the cities list, with a TTL.
 *
 * During a Next.js build, generateStaticParams + every page's generateMetadata
 * + every page's component all call getAllCities(). Without this cache, that
 * would be one fetch per call - thousands of fetches per build.
 *
 * The TTL matters in production: a warm serverless instance reuses module
 * state across requests, so an unexpiring cache served a stale leader list
 * indefinitely (New Carrollton, 2026-09-10). Entries now expire after
 * CACHE_TTL_MS and the next caller refetches.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedCities: City[] | null = null;
let cachedAt = 0;
let cachePromise: Promise<City[]> | null = null;

/**
 * Fetch every city in one call via the /cities/all bulk endpoint.
 *
 * Uses `cache: "no-store"` to bypass Next.js's built-in data cache, which has
 * a 2MB response size limit (our response is ~2.25MB). Without this, the data
 * cache write fails silently and ISR pages don't actually get generated as
 * static HTML.
 *
 * Page-level caching (ISR via `export const revalidate` on the page module)
 * works independently of fetch-level data cache, so pre-rendered pages still
 * regenerate on schedule.
 *
 * Module-level memoization (above) ensures concurrent callers in the same
 * Node process share one in-flight fetch instead of stampeding the API.
 *
 * Retries once; if both tries fail, returns the last good copy, or an empty
 * array when there is none (or the API key is missing).
 */
export async function getAllCities(): Promise<City[]> {
  if (cachedCities !== null && Date.now() - cachedAt < CACHE_TTL_MS) return cachedCities;
  if (cachePromise !== null) return cachePromise;

  if (!API_KEY) return [];

  cachePromise = (async () => {
    // Two tries, a second apart: a fresh server instance's first fetch of the
    // ~2 MB list sometimes fails, and search answered 502 right after the
    // Oct 12 deploy. On a second failure an older copy beats an empty list.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/cities/all`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        const cities = (json.data || []) as City[];
        cachedCities = cities;
        cachedAt = Date.now();
        cachePromise = null; // clear so the next expiry triggers a real refetch
        return cities;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[getAllCities] attempt ${attempt} failed:`, message);
        if (attempt === 1) await new Promise((r) => setTimeout(r, 1000));
      }
    }
    cachePromise = null;
    if (cachedCities !== null) {
      console.error("[getAllCities] serving the previous copy of the city list");
      return cachedCities;
    }
    return [];
  })();

  return cachePromise;
}

export type LeadershipHistoryRow = {
  id: number;
  full_name: string;
  leader_title: string | null;
  is_current: boolean;
  recorded_at: string | null;
  last_verified_at: string | null;
};

export type PublishedChange = {
  action: "accept" | "correct";
  before_name: string | null;
  before_title: string | null;
  after_name: string | null;
  after_title: string | null;
  source_url: string | null;
  created_at: string;
};

export type CityHistory = {
  leadership_history: LeadershipHistoryRow[];
  published_changes: PublishedChange[];
};

/**
 * Published leadership history for one city (GET /cities/{id}).
 * Returns null when unavailable (request failed, or an older API that doesn't
 * send history yet), so the page can hide the section instead of inventing one.
 */
export async function getCityHistory(cityId: number): Promise<CityHistory | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${API_BASE}/cities/${cityId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json.leadership_history)) return null;
    return {
      leadership_history: json.leadership_history,
      published_changes: Array.isArray(json.published_changes) ? json.published_changes : [],
    };
  } catch {
    return null;
  }
}

export type CityDetail = {
  city: City;
  /** Null when history is unavailable, so the page hides that section. */
  history: CityHistory | null;
};

// Every slug citySlug() can produce. Anything else (bot noise, typos with
// capitals or dots) cannot match a city, so it is answered without an API call.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseHistory(json: { leadership_history?: unknown; published_changes?: unknown }): CityHistory | null {
  if (!Array.isArray(json.leadership_history)) return null;
  return {
    leadership_history: json.leadership_history as LeadershipHistoryRow[],
    published_changes: Array.isArray(json.published_changes) ? (json.published_changes as PublishedChange[]) : [],
  };
}

/**
 * One city by its URL slug, with its published history, in a single small
 * request (GET /cities/by-slug/{slug}, a few KB) instead of downloading every
 * city (~2.25 MB) to find one. City pages used to do the latter on every
 * render, which is what pushed Supabase egress over the Free plan in Oct 2026.
 *
 * Response is under Next.js's 2 MB data-cache limit, so the normal fetch cache
 * applies here (unlike getAllCities, which must use no-store).
 *
 * Falls back to the old full-list lookup when the API is older than the
 * by-slug route or the request fails, so deploy order between the API and the
 * site does not matter. A 404 whose detail is "city not found" is a real miss.
 */
export async function getCityDetailBySlug(slug: string): Promise<CityDetail | null> {
  if (!SLUG_RE.test(slug) || slug.length > 120) return null;

  if (API_KEY) {
    try {
      const res = await fetch(`${API_BASE}/cities/by-slug/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.city) return { city: json.city as City, history: parseHistory(json) };
      } else if (res.status === 404) {
        const body = await res.json().catch(() => null);
        if (body && body.detail === "city not found") return null;
        // Any other 404 means the API does not have the route yet: fall back.
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[getCityDetailBySlug] falling back to the full list:", message);
    }
  }

  const city = findCityBySlug(await getAllCities(), slug);
  if (!city) return null;
  return { city, history: await getCityHistory(city.id) };
}

/** Just the city record for a slug (pages that don't show history). */
export async function getCityBySlug(slug: string): Promise<City | null> {
  return (await getCityDetailBySlug(slug))?.city ?? null;
}
