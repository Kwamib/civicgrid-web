import type { CitySummary } from "@/lib/cities";
import { compareCities, inPopulationBand, POPULATION_BANDS, SORT_OPTIONS, type PopulationBand, type SortKey } from "@/lib/format";

/**
 * Server-side city search used by /api/search. Filtering and sorting run over
 * the full dataset on the server; only the requested page goes to the browser,
 * so the public site never hands out the whole dataset in one response.
 */

export const MAX_PAGE_SIZE = 25;

export type SearchParams = {
  q: string;
  state: string;
  pop: PopulationBand;
  sort: SortKey;
  page: number;
  pageSize: number;
};

export type SearchResult = {
  data: CitySummary[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  datasetCount: number;
  states: [string, string][];
};

export function parseSearchParams(sp: URLSearchParams): SearchParams {
  const pop = (sp.get("pop") || "") as PopulationBand;
  const sort = (sp.get("sort") || "largest") as SortKey;
  const page = Math.max(1, Math.floor(Number(sp.get("page")) || 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(Number(sp.get("pageSize")) || 10)));
  return {
    q: (sp.get("q") || "").slice(0, 120),
    state: (sp.get("state") || "").toUpperCase().slice(0, 2),
    pop: POPULATION_BANDS.some((b) => b.value === pop) ? pop : "",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "largest",
    page,
    pageSize,
  };
}

/** Relevance score; lower is better, null = no match. */
export function matchScore(c: CitySummary, q: string): number | null {
  const city = c.city.toLowerCase();
  const stateCode = c.state_code.toLowerCase();
  const stateName = (c.state_name || "").toLowerCase();
  const leader = (c.leader_name || "").toLowerCase();

  // "Laurel, MD" or "Laurel, Maryland": the city part AND the state must match.
  if (q.includes(",")) {
    const [cityPart, statePart] = q.split(",").map((x) => x.trim());
    if (statePart && !(stateCode === statePart || stateName.startsWith(statePart))) return null;
    if (!city.includes(cityPart)) return null;
    return city === cityPart ? 0 : city.startsWith(cityPart) ? 1 : 2;
  }
  if (city === q) return 0;
  if (city.startsWith(q)) return 1;
  if (city.includes(q)) return 2;
  if (stateCode === q) return 3;
  if (stateName.includes(q)) return 4;
  if (leader.includes(q)) return 5;
  return null;
}

export function searchCities(all: CitySummary[], p: SearchParams): SearchResult {
  const q = p.q.trim().toLowerCase();
  const cmp = compareCities<CitySummary>(p.sort);
  const hits: { c: CitySummary; score: number }[] = [];
  for (const c of all) {
    if (p.state && c.state_code !== p.state) continue;
    if (!inPopulationBand(c.population, p.pop)) continue;
    const score = q ? matchScore(c, q) : 0;
    if (score === null) continue;
    hits.push({ c, score });
  }
  hits.sort((a, b) => a.score - b.score || cmp(a.c, b.c));

  const pageCount = Math.max(1, Math.ceil(hits.length / p.pageSize));
  const page = Math.min(p.page, pageCount);
  const data = hits.slice((page - 1) * p.pageSize, page * p.pageSize).map((h) => h.c);

  const stateMap = new Map<string, string>();
  for (const c of all) if (c.state_code) stateMap.set(c.state_code, c.state_name || c.state_code);
  const states = [...stateMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));

  return { data, total: hits.length, page, pageSize: p.pageSize, pageCount, datasetCount: all.length, states };
}
