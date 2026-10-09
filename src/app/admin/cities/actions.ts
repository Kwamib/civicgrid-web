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
};


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
): Promise<{ ok: boolean; error?: string; mayor?: string }> {
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
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("updateLeader failed:", res.status, text);
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.detail === "string") detail = parsed.detail;
    } catch {
      /* not JSON */
    }
    return { ok: false, error: detail || `Request failed (${res.status})` };
  }
  const json = await res.json();
  return { ok: true, mayor: json.new_current?.full_name ?? name };
}
