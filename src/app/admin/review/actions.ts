"use server";

import { requireAdminUser } from "@/lib/admin";

// Override for local development against a local API; defaults to production.
const API_BASE = process.env.CIVICGRID_API_BASE || "https://api.civicgrid.org";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export type ReviewStatus = "pending" | "retry";

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
  created_at?: string | null;
  // Added by API migration 007 (absent on older API versions):
  proposed_title?: string | null;
  evidence?: string | null;
  finding_type?: string | null;
  retry_requested_at?: string | null;
  review_reason?: string | null;
  governance_type?: string | null;
  mayor_url?: string | null;
  city_url?: string | null;
  current_leader_id?: number | null;
  current_name?: string | null;
  current_title?: string | null;
  current_last_verified_at?: string | null;
  stale?: boolean;
  already_published?: boolean;
};

export type ReviewEvent = {
  id: number;
  action: "accept" | "correct" | "dismiss" | "retry";
  actor: string;
  reason: string | null;
  before_name: string | null;
  after_name: string | null;
  after_title: string | null;
  confirmed_current: boolean;
  created_at: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string; conflict?: boolean };

async function adminFetch(path: string, init?: RequestInit) {
  if (!ADMIN_TOKEN) throw new Error("ADMIN_TOKEN not configured");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
}

async function toResult(res: Response, label: string): Promise<ActionResult> {
  if (res.ok) return { ok: true };
  const text = await res.text();
  console.error(`${label} failed:`, res.status, text);
  let detail = text;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.detail === "string") detail = parsed.detail;
    else if (Array.isArray(parsed.detail)) detail = parsed.detail.map((d: { msg?: string }) => d.msg).join("; ");
  } catch {
    /* not JSON */
  }
  if (res.status === 404 && label !== "dismiss" && label !== "accept") {
    detail = `${detail} (If this keeps happening, the API may not have the review-workflow update yet.)`;
  }
  return { ok: false, error: detail || `Request failed (${res.status})`, conflict: res.status === 409 };
}

export async function getProposals(
  status: ReviewStatus = "pending",
  limit = 100,
  offset = 0,
): Promise<{ proposals: Proposal[]; total: number; counts: Record<string, number> }> {
  await requireAdminUser();
  const res = await adminFetch(`/admin/proposals?status=${status}&limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    console.error("getProposals failed:", res.status, await res.text());
    return { proposals: [], total: 0, counts: {} };
  }
  const json = await res.json();
  return {
    proposals: json.proposals ?? [],
    total: json.total ?? 0,
    counts: json.counts ?? { [status]: json.total ?? 0 },
  };
}

type Common = { expectedLeaderId?: number | null; reason?: string; acknowledgeStale?: boolean };

function commonBody(actor: string, c: Common) {
  return {
    actor,
    reason: c.reason?.trim() || null,
    expected_leader_id: c.expectedLeaderId ?? null,
    acknowledge_stale: Boolean(c.acknowledgeStale),
  };
}

export async function acceptFinding(id: number, opts: Common & { leaderTitle?: string }): Promise<ActionResult> {
  const user = await requireAdminUser();
  const res = await adminFetch(`/admin/proposals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ ...commonBody(user.email!, opts), leader_title: opts.leaderTitle?.trim() || null }),
  });
  return toResult(res, "accept");
}

export async function correctFinding(
  id: number,
  opts: Common & { fullName: string; leaderTitle?: string; sourceUrl?: string; reason: string },
): Promise<ActionResult> {
  const user = await requireAdminUser();
  if (!opts.fullName.trim()) return { ok: false, error: "Enter the correct name." };
  if (!opts.reason || opts.reason.trim().length < 3) return { ok: false, error: "A reason is required for a correction." };
  const res = await adminFetch(`/admin/proposals/${id}/correct`, {
    method: "POST",
    body: JSON.stringify({
      ...commonBody(user.email!, opts),
      full_name: opts.fullName.trim(),
      leader_title: opts.leaderTitle?.trim() || null,
      source_url: opts.sourceUrl?.trim() || null,
    }),
  });
  return toResult(res, "correct");
}

export async function dismissFinding(id: number, opts: Common & { confirmCurrent?: boolean }): Promise<ActionResult> {
  const user = await requireAdminUser();
  const res = await adminFetch(`/admin/proposals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ ...commonBody(user.email!, opts), confirm_current: Boolean(opts.confirmCurrent) }),
  });
  return toResult(res, "dismiss");
}

export async function retryFinding(id: number, opts: Common): Promise<ActionResult> {
  const user = await requireAdminUser();
  const res = await adminFetch(`/admin/proposals/${id}/retry`, {
    method: "POST",
    body: JSON.stringify(commonBody(user.email!, opts)),
  });
  return toResult(res, "retry");
}

export async function getReviewEvents(cityId: number): Promise<ReviewEvent[]> {
  await requireAdminUser();
  const res = await adminFetch(`/admin/review-events?city_id=${cityId}&limit=10`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.events ?? [];
}
