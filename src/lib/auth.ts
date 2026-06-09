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

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

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
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
});
