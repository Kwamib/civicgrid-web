import { getCurrentUser } from "@/lib/auth";

/** ADMIN_EMAILS is a comma-separated allowlist set in Vercel (server-only). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/** Throws unless the signed-in user is an admin. Returns the user. */
export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Not authorized");
  }
  return user;
}
