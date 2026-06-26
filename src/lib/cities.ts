const API_BASE = "https://api.civicgrid.org";
const API_KEY = process.env.CIVICGRID_API_KEY;

export type City = {
  id: number;
  city: string;
  state_code: string;
  state_name: string;
  county: string;
  metro_area: string;
  city_type: string;
  population: number;
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
};

/**
 * Process-level cache of the cities list.
 *
 * During a Next.js build, generateStaticParams + every page's generateMetadata
 * + every page's component all call getAllCities(). Without this cache, that
 * would be one fetch per call - thousands of fetches per build.
 *
 * Module-level memoization is bulletproof: one fetch per Node process for
 * the lifetime of that process. Each build worker fetches once at most.
 *
 * Cleared automatically when the process exits, so production runtime
 * behavior is unchanged - each new serverless invocation starts fresh.
 */
let cachedCities: City[] | null = null;
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
 * Returns an empty array if the API key is missing or the request fails.
 */
export async function getAllCities(): Promise<City[]> {
  if (cachedCities !== null) return cachedCities;
  if (cachePromise !== null) return cachePromise;

  if (!API_KEY) return [];

  cachePromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/cities/all`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      });

      if (!res.ok) {
        console.error(`[getAllCities] API returned ${res.status}`);
        cachePromise = null;
        return [];
      }

      const json = await res.json();
      const cities = (json.data || []) as City[];
      cachedCities = cities;
      return cities;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[getAllCities] fetch failed:", message);
      cachePromise = null;
      return [];
    }
  })();

  return cachePromise;
}
