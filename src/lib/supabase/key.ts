/**
 * The public Supabase key the website uses for login.
 *
 * Supabase is retiring the legacy "anon" key by the end of 2026 in favor of a
 * publishable key (sb_publishable_...). Both carry the same low privileges.
 * Reads the publishable key first and falls back to the legacy key, so the
 * switch is: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel, redeploy,
 * test login, then remove NEXT_PUBLIC_SUPABASE_ANON_KEY and deactivate the
 * legacy key in Supabase (Settings > API Keys; reversible).
 *
 * NEXT_PUBLIC_ values are built into the page at build time, so a changed
 * value needs a redeploy.
 */
export function supabasePublicKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  return key;
}
