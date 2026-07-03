"use server";

import { getCurrentUser } from "@/lib/auth";

const API_BASE = "https://api.civicgrid.org";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export type Proposal = {
  id: number;
  city_id: number;
  city: string;
  state_code: string;
  population: number | null;
  db_mayor: string | null;
  web_mayor: string | null;
  source_url: string | null;
  confidence: string | null;
  status: string;
};

async function requireAdminUser() {
  const user = await getCurrentUser();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!user || !adminEmails.includes(user.email ?? "")) {
    throw new Error("Not authorized");
  }
  return user;
}

export async function getProposals(limit = 100, offset = 0): Promise<{ proposals: Proposal[]; total: number }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) throw new Error("ADMIN_TOKEN not configured");

  const res = await fetch(`${API_BASE}/admin/proposals?status=pending&limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("getProposals failed:", res.status, await res.text());
    return { proposals: [], total: 0 };
  }
  const json = await res.json();
  return { proposals: json.proposals ?? [], total: json.total ?? 0 };
}

export async function approveProposal(id: number): Promise<{ ok: boolean; error?: string }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) return { ok: false, error: "ADMIN_TOKEN not configured" };

  const res = await fetch(`${API_BASE}/admin/proposals/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("approveProposal failed:", res.status, text);
    return { ok: false, error: `${res.status}: ${text}` };
  }
  return { ok: true };
}

export async function rejectProposal(id: number): Promise<{ ok: boolean; error?: string }> {
  await requireAdminUser();
  if (!ADMIN_TOKEN) return { ok: false, error: "ADMIN_TOKEN not configured" };

  const res = await fetch(`${API_BASE}/admin/proposals/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("rejectProposal failed:", res.status, text);
    return { ok: false, error: `${res.status}: ${text}` };
  }
  return { ok: true };
}
