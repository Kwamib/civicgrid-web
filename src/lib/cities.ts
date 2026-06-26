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
 * Fetch every city in one call via the /cities/all bulk endpoint.
 *
 * Returns an empty array if the API key is missing or the request fails.
 * Vercel edge-caches the response for 1 hour via next.revalidate, so
 * after the first call per region this is effectively a cache lookup.
 *
 * Replaces the 30+ sequential paginated calls we used to make.
 */
export async function getAllCities(): Promise<City[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(`${API_BASE}/cities/all`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`[getAllCities] API returned ${res.status}`);
      return [];
    }

    const json = await res.json();
    return (json.data || []) as City[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getAllCities] fetch failed:", message);
    return [];
  }
}