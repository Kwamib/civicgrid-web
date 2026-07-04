"use server";

import { getCurrentUser } from "@/lib/auth";

const API_BASE = "https://api.civicgrid.org";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export type CityRow = {
  city_id: number;
  city: string;
  state_code: string;
  population: number | null;
  leader_id: number | null;
  full_name: string | null;
  leader_title: string | null;
  political_party: string | null;
  last_verified_at: string | null;
  url: string | null;
};

async function requireAdminUser() {
  const user = await getCurrentUser();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!user || !adminEmails.includes(user.email ?? "")) {
    throw new Error("Not authorized");
  }
  return user;
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

export async function updateLeader(
  cityId: number,
  fullName: string,
  leaderTitle: string,
  source: string,
): Promise<{ ok: boolean; error?: string; mayor?: string }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) return { ok: false, error: "ADMIN_TOKEN not configured" };

  const name = fullName.trim();
  if (!name) return { ok: false, error: "Name is required" };
  // derive last_name (skip suffixes)
  const parts = name.replace(/,/g, "").split(/\s+/).filter(Boolean);
  const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);
  let lastName = parts[parts.length - 1] || name;
  if (parts.length > 1 && suffixes.has(lastName.toLowerCase())) {
    lastName = parts[parts.length - 2];
  }

  const res = await fetch(`${API_BASE}/admin/cities/${cityId}/leaders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      full_name: name,
      last_name: lastName,
      leader_title: leaderTitle.trim() || "Mayor",
      source: source.trim() || null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("updateLeader failed:", res.status, text);
    return { ok: false, error: `${res.status}: ${text}` };
  }
  const json = await res.json();
  return { ok: true, mayor: json.new_current?.full_name ?? name };
}
