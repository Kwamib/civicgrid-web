/**
 * OAuth callback handler.
 *
 * Supabase redirects users here after they authenticate with Google or GitHub.
 * The provider includes a `code` query param that we exchange for a session.
 * On success, redirect to the user's intended destination (default: /dashboard).
 *
 * Magic links also route through this handler — Supabase appends the code
 * to the link URL embedded in the email.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful sign-in. Redirect to dashboard (or wherever they were headed).
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with error context.
  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
