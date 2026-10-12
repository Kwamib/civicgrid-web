/**
 * Small per-visitor limit for the website's own routes (/api/search).
 *
 * Counts live in the memory of each server instance, so this is a guard
 * against one visitor hammering the site (runaway scripts, scraping every
 * page of search), not a precise quota. The API's own limits (Redis, per
 * key) are the real ones.
 */

const WINDOW_MS = 60_000;
const MAX_TRACKED = 10_000;

const hits = new Map<string, number[]>();

export function clientIp(headers: Headers): string {
  // Vercel sets x-forwarded-for itself (client values are overwritten).
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}

/** Returns 0 when allowed, otherwise the seconds to wait. */
export function limit(key: string, perMinute: number, now = Date.now()): number {
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= perMinute) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000));
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_TRACKED) {
    // drop the oldest visitors first (Map keeps insertion order)
    for (const k of hits.keys()) {
      hits.delete(k);
      if (hits.size <= MAX_TRACKED / 2) break;
    }
  }
  return 0;
}
