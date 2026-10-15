"use server";

import { requireAdminUser } from "@/lib/admin";

// Override for local development against a local API; defaults to production.
const API_BASE = process.env.CIVICGRID_API_BASE || "https://api.civicgrid.org";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export type CityRow = {
  city_id: number;
  city: string;
  state_code: string;
  population: number | null;
  governance_type?: string | null;
  leader_id: number | null;
  full_name: string | null;
  leader_title: string | null;
  political_party?: string | null;
  last_verified_at: string | null;
  url: string | null;
  flagged_at?: string | null;
  mayor_url?: string | null;
  last_check_outcome?: string | null;
  last_check_at?: string | null;
  /** Discovery v12 (migration 013): why the stored website is wrong, and the city's own .gov if it refused our script. */
  link_note?: string | null;
  suggested_url?: string | null;
};

/** Manual-check queue tabs (API GET /admin/queue, migration 012). */
export type QueueKind = "unverified" | "blocked" | "no_name" | "wrong_link";
export type QueueCounts = Record<QueueKind, number>;

export async function listQueue(
  kind: QueueKind,
  offset = 0,
): Promise<{ cities: CityRow[]; counts: QueueCounts | null }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) throw new Error("ADMIN_TOKEN not configured");
  const params = new URLSearchParams({ kind, limit: "25", offset: String(offset) });
  const res = await fetch(`${API_BASE}/admin/queue?${params}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("listQueue failed:", res.status, await res.text());
    return { cities: [], counts: null };
  }
  const json = await res.json();
  return { cities: json.cities ?? [], counts: json.counts ?? null };
}


export async function searchCities(q: string, onlyUnverified = false): Promise<CityRow[]> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) throw new Error("ADMIN_TOKEN not configured");
  if (!q.trim()) return [];
  const params = new URLSearchParams({ q: q.trim(), limit: "25" });
  if (onlyUnverified) params.set("only_unverified", "true");
  const res = await fetch(`${API_BASE}/admin/cities/search?${params}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("searchCities failed:", res.status, await res.text());
    return [];
  }
  const json = await res.json();
  return json.cities ?? [];
}

export async function listUnsure(offset = 0): Promise<{ cities: CityRow[]; total: number }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) throw new Error("ADMIN_TOKEN not configured");
  const res = await fetch(`${API_BASE}/admin/unsure?limit=25&offset=${offset}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("listUnsure failed:", res.status, await res.text());
    return { cities: [], total: 0 };
  }
  const json = await res.json();
  return { cities: json.cities ?? [], total: json.total_remaining ?? 0 };
}

/**
 * chief_executive: the elected head (mayor, select board chair, village president).
 * chief_administrator: the appointed manager (town administrator, city manager).
 * Saving one role never changes the other (API migration 008).
 */
export type LeaderRole = "chief_executive" | "chief_administrator";

export async function updateLeader(
  cityId: number,
  fullName: string,
  leaderTitle: string,
  source: string,
  governanceType: string,
  role: LeaderRole = "chief_executive",
  samePerson = false,
  confirmSource = false,
): Promise<{ ok: boolean; error?: string; mayor?: string; sourceNotOfficial?: boolean }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) return { ok: false, error: "ADMIN_TOKEN not configured" };
  const name = fullName.trim();
  if (!name) return { ok: false, error: "Name is required" };
  const defaultTitle = role === "chief_administrator" ? "Town Administrator" : "Mayor";
  // last_name is derived by the API (strips titles, skips Jr/Sr/II-IV suffixes).
  const res = await fetch(`${API_BASE}/admin/cities/${cityId}/leaders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      full_name: name,
      role,
      leader_title: leaderTitle.trim() || defaultTitle,
      source: source.trim() || null,
      governance_type: governanceType || null,
      same_person: samePerson,
      // The API refuses a leader source that isn't plausibly the city's own
      // site (source_not_official) unless the reviewer confirms it.
      confirm_source: confirmSource,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("updateLeader failed:", res.status, text);
    let detail = text;
    let sourceNotOfficial = false;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.detail === "string") detail = parsed.detail;
      else if (parsed.detail?.message) {
        detail = parsed.detail.message;
        sourceNotOfficial = parsed.detail.error === "source_not_official";
      }
    } catch {
      /* not JSON */
    }
    return { ok: false, error: detail || `Request failed (${res.status})`, sourceNotOfficial };
  }
  const json = await res.json();
  return { ok: true, mayor: json.new_current?.full_name ?? name };
}

/** Fix a city's website and/or official leadership page (API PATCH /admin/cities/{id}/links). */
export async function updateCityLinks(
  cityId: number,
  links: { url?: string; mayorUrl?: string },
  confirmOfficial = false,
): Promise<{ ok: boolean; error?: string; url?: string | null; mayorUrl?: string | null }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) return { ok: false, error: "ADMIN_TOKEN not configured" };
  const body: Record<string, unknown> = { confirm_official: confirmOfficial };
  if (links.url !== undefined) body.url = links.url.trim();
  if (links.mayorUrl !== undefined) body.mayor_url = links.mayorUrl.trim();
  const res = await fetch(`${API_BASE}/admin/cities/${cityId}/links`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = typeof parsed.detail === "string" ? parsed.detail : parsed.detail?.message ?? text;
    } catch {
      /* not JSON */
    }
    return { ok: false, error: detail || `Request failed (${res.status})` };
  }
  const json = await res.json();
  return { ok: true, url: json.city?.url ?? null, mayorUrl: json.city?.mayor_url ?? null };
}
