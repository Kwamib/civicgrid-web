import type { NextConfig } from "next";

// Sent on every response. No Content-Security-Policy beyond frame-ancestors
// yet: a full policy needs its own careful change (Next.js inline scripts,
// Supabase auth, analytics) so it can't break the site.
const SECURITY_HEADERS = [
  // Browsers use HTTPS only for this host for two years. includeSubDomains covers
  // only names under www.civicgrid.org, so the apex and api. are unaffected.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // No framing by other sites (clickjacking). Both forms for old and new browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Don't let browsers guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only "civicgrid.org", never the full page address.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses none of these.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    // City pages live at /cities/<slug>; the city list is the home page.
    return [{ source: "/cities", destination: "/", permanent: false }];
  },
};

export default nextConfig;
