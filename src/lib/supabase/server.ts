/**
 * Supabase client for server components, server actions, and route handlers.
 *
 * Reads the session cookie set by the browser client to identify the current user.
 * Cannot set cookies from a Server Component — only from Server Actions or
 * Route Handlers (per Next.js 16's request-time API rules).
 *
 * Usage:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In Server Components, attempting to set cookies will throw.
          // Wrapping in try/catch lets the createServerClient usage work
          // across both Server Components (read-only) and Server Actions
          // (read-write). See Next.js 16 cookies() async API docs.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context — cookie writes are no-ops here.
          }
        },
      },
    },
  );
}
