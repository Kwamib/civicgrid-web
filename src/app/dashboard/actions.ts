/**
 * Server Actions for the dashboard.
 *
 * These functions run on the server, fetch the current user's JWT,
 * and call our FastAPI backend's /me endpoints with it as a Bearer token.
 *
 * Server Actions handle the "form action" pattern in Next.js 16 — no need
 * for traditional API routes when the page itself is server-rendered.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionToken } from "@/lib/auth";

const API_BASE = "https://api.civicgrid.org";

type KeyInfo = {
  id: number;
  key_prefix: string;
  tier: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  request_count: number;
};

/**
 * Fetch all API keys for the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getUserKeys(): Promise<KeyInfo[] | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/me/keys`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch keys:", res.status, await res.text());
    return [];
  }

  const json = await res.json();
  return json.data ?? [];
}

/**
 * Generate a new API key for the current user.
 * Returns the full plaintext key (only available here, never shown again).
 */
export async function generateKey(formData: FormData): Promise<{
  success: boolean;
  key?: string;
  error?: string;
}> {
  const token = await getSessionToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const label = (formData.get("label") as string)?.trim() || null;
  const tier = (formData.get("tier") as string) || "free";

  const res = await fetch(`${API_BASE}/me/keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ label, tier }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return { success: false, error: `API error ${res.status}: ${text}` };
  }

  const json = await res.json();
  revalidatePath("/dashboard");
  return { success: true, key: json.key };
}

/**
 * Revoke (soft-delete) an API key by its prefix.
 * Only allows revoking keys that belong to the current user.
 */
export async function revokeKey(prefix: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const token = await getSessionToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${API_BASE}/me/keys/${prefix}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return { success: false, error: `Failed to revoke: ${res.status}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Sign out the current user and redirect to landing page.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
