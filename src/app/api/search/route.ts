import { NextResponse } from "next/server";

const API_BASE = "https://api.civicgrid.org";
const API_KEY = process.env.CIVICGRID_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "CIVICGRID_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${API_BASE}/cities/all`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Vercel edge cache for 1 hour, regenerate in background after that.
      // This makes the bulk fetch cost happen at most once per hour,
      // not once per visitor.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API returned ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const json = await res.json();
    const cities = json.data || [];

    return NextResponse.json(
      { data: cities },
      {
        headers: {
          // Tell downstream caches (browser, Cloudflare) to cache for 5 min,
          // serve stale up to 24 hours while revalidating in background.
          "Cache-Control":
            "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/search] caught error:", message);
    return NextResponse.json(
      { error: "Failed to fetch cities", message },
      { status: 502 },
    );
  }
}
