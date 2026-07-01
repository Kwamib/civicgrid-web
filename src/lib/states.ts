import { getAllCities, type City } from "@/lib/cities";

export type StateSummary = {
  state_code: string;
  state_name: string;
  city_count: number;
  total_population: number;
  party_breakdown: Record<string, number>;
  dominant_party: string;
  top_cities: City[];
};

export const TOP_CITIES_LIMIT = 20;

function normalizeParty(party: string | null | undefined): string {
  const p = (party || "").trim();
  return p.length ? p : "Unknown";
}

export async function getAllStates(): Promise<StateSummary[]> {
  const cities = await getAllCities();
  if (cities.length === 0) return [];

  const byState = new Map<string, City[]>();
  for (const c of cities) {
    if (!c.state_code) continue;
    const arr = byState.get(c.state_code);
    if (arr) arr.push(c);
    else byState.set(c.state_code, [c]);
  }

  const summaries: StateSummary[] = [];
  for (const [code, rows] of byState) {
    const party_breakdown: Record<string, number> = {};
    let total_population = 0;

    for (const row of rows) {
      total_population += row.population || 0;
      const party = normalizeParty(row.leader_party);
      party_breakdown[party] = (party_breakdown[party] || 0) + 1;
    }

    let dominant_party = "Unknown";
    let dominant_count = -1;
    for (const [party, count] of Object.entries(party_breakdown)) {
      if (count > dominant_count) {
        dominant_count = count;
        dominant_party = party;
      }
    }

    const top_cities = [...rows]
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, TOP_CITIES_LIMIT);

    summaries.push({
      state_code: code,
      state_name: rows[0].state_name || code,
      city_count: rows.length,
      total_population,
      party_breakdown,
      dominant_party,
      top_cities,
    });
  }

  summaries.sort((a, b) => b.city_count - a.city_count);
  return summaries;
}

export async function getStateBySlug(slug: string): Promise<StateSummary | null> {
  const { stateSlug } = await import("@/lib/slug");
  const states = await getAllStates();
  return states.find((s) => stateSlug(s.state_name) === slug) ?? null;
}
