import { NextResponse } from "next/server";

const API_BASE = "https://api.civicgrid.org";
const API_KEY = process.env.CIVICGRID_API_KEY;

let cached: { data: unknown[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function GET() {
  console.log("[/api/search] called");
  console.log("[/api/search] API_KEY present:", !!API_KEY);
  console.log("[/api/search] API_KEY prefix:", API_KEY?.slice(0, 12) + "...");

  if (!API_KEY) {
    return NextResponse.json(
      { error: "CIVICGRID_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ data: cached.data, cached: true });
  }

  try {
    const allCities: unknown[] = [];
    let offset = 0;
    const pageSize = 100;
    const maxPages = 40;

    for (let i = 0; i < maxPages; i++) {
      const url = `${API_BASE}/cities?limit=${pageSize}&offset=${offset}`;
      console.log(`[/api/search] fetching ${url}`);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });

      console.log(`[/api/search] response status: ${res.status}`);

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[/api/search] API error body: ${errBody}`);
        throw new Error(`API returned ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const json = await res.json();
      const page = json.data || [];
      console.log(`[/api/search] page ${i} returned ${page.length} items`);

      allCities.push(...page);

      if (page.length < pageSize) break;
      offset += pageSize;
    }

    console.log(`[/api/search] total cities: ${allCities.length}`);

    cached = { data: allCities, fetchedAt: Date.now() };
    return NextResponse.json({ data: allCities, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/search] caught error:", message);
    return NextResponse.json(
      { error: "Failed to fetch cities", message },
      { status: 502 }
    );
  }
}
