/**
 * Data Access Layer for authentication.
 *
 * Following Next.js 16's recommended DAL pattern (see /docs/app/guides/data-security):
 * - Single source of truth for "who is the current user?"
 * - Cached per-request via React.cache so calling it multiple times is free
 * - Returns null if not authenticated (no exceptions thrown)
 *
 * Usage in protected pages:
 *   const user = await getCurrentUser();
 *   if (!user) redirect("/login");
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// If Supabase isn't configured (a Preview deployment without its settings),
// creating the client throws. Treat that as "signed out" so public pages still
// render; protected pages already redirect or refuse when there is no user.
async function clientOrNull() {
  try {
    return await createClient();
  } catch (err) {
    console.error("Supabase auth unavailable; treating the visitor as signed out:", (err as Error).message);
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  const supabase = await clientOrNull();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Get the current user's Supabase JWT for use as a Bearer token
 * when calling our FastAPI backend's /me endpoints.
 *
 * Returns null if no active session.
 */
export const getSessionToken = cache(async () => {
  const supabase = await clientOrNull();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
});
