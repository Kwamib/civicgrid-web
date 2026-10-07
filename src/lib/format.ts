/** Shared display helpers. Missing values are shown as missing, never invented. */

export const NOT_AVAILABLE = "Not available";

export function formatPopulation(n: number | null | undefined): string {
  // Zero is a real value; only null/undefined is unknown.
  if (n === null || n === undefined || Number.isNaN(n)) return NOT_AVAILABLE;
  return n.toLocaleString("en-US");
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export function displayHost(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Only http(s) links are rendered as links; anything else is shown as text. */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Population bands: non-overlapping, half-open [min, max).            */
/* ------------------------------------------------------------------ */

export type PopulationBand =
  | ""
  | "under10k"
  | "10k-50k"
  | "50k-100k"
  | "100k-500k"
  | "500k-plus"
  | "unknown";

export const POPULATION_BANDS: { value: PopulationBand; label: string }[] = [
  { value: "", label: "All populations" },
  { value: "under10k", label: "Under 10,000" },
  { value: "10k-50k", label: "10,000–49,999" },
  { value: "50k-100k", label: "50,000–99,999" },
  { value: "100k-500k", label: "100,000–499,999" },
  { value: "500k-plus", label: "500,000+" },
  { value: "unknown", label: "Population unknown" },
];

const BAND_RANGES: Record<string, [number, number]> = {
  under10k: [0, 10_000],
  "10k-50k": [10_000, 50_000],
  "50k-100k": [50_000, 100_000],
  "100k-500k": [100_000, 500_000],
  "500k-plus": [500_000, Infinity],
};

export function inPopulationBand(pop: number | null | undefined, band: PopulationBand): boolean {
  if (!band) return true;
  const known = pop !== null && pop !== undefined && !Number.isNaN(pop);
  if (band === "unknown") return !known;
  if (!known) return false;
  const [min, max] = BAND_RANGES[band];
  return pop >= min && pop < max;
}

export type SortKey = "largest" | "smallest" | "name";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "largest", label: "Largest population" },
  { value: "smallest", label: "Smallest population" },
  { value: "name", label: "Name A–Z" },
];

/** Comparator. Unknown populations always sort last in numeric sorts; ties break by name, then state. */
export function compareCities<T extends { city: string; state_code: string; population: number | null }>(
  sort: SortKey,
): (a: T, b: T) => number {
  const byName = (a: T, b: T) =>
    a.city.localeCompare(b.city, "en-US") || a.state_code.localeCompare(b.state_code);
  if (sort === "name") return byName;
  return (a, b) => {
    const an = a.population === null || a.population === undefined;
    const bn = b.population === null || b.population === undefined;
    if (an || bn) return an && bn ? byName(a, b) : an ? 1 : -1;
    const diff = sort === "largest" ? b.population! - a.population! : a.population! - b.population!;
    return diff || byName(a, b);
  };
}

/* ------------------------------------------------------------------ */
/* Verification vocabulary (mirrors the API's public fields).          */
/* ------------------------------------------------------------------ */

export type CheckResult = "confirmed" | "under_review" | "check_failed" | null | undefined;

export function verificationSummary(c: {
  leader_name?: string | null;
  leader_last_verified_at?: string | null;
  last_verified_method?: string | null;
  last_check_result?: CheckResult;
}): { tone: "verified" | "pending" | "warning" | "none"; label: string } {
  if (!c.leader_name) return { tone: "none", label: "No leader on record" };
  if (c.last_check_result === "under_review")
    return { tone: "pending", label: "Change under review" };
  const verified = formatDate(c.leader_last_verified_at);
  if (verified) {
    const how = c.last_verified_method === "human" ? "Reviewed" : "Verified";
    return { tone: "verified", label: `${how} ${verified}` };
  }
  if (c.last_check_result === "check_failed")
    return { tone: "warning", label: "Last check failed" };
  return { tone: "none", label: "Not yet verified" };
}

export const GOVERNANCE_LABELS: Record<string, string> = {
  mayor: "Mayor",
  council_manager: "Council–manager",
  select_board: "Select board",
  town_administrator: "Town administrator",
  commission: "Commission",
  unknown: "Unclear",
};

export function governanceLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return GOVERNANCE_LABELS[value] ?? value;
}
