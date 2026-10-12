import { NextResponse, type NextRequest } from "next/server";
import { getAllCities, toSummary } from "@/lib/cities";
import { parseSearchParams, searchCities } from "@/lib/search";
import { clientIp, limit } from "@/lib/rateLimit";

// Typing in the search box sends a request per pause; 60 a minute is far
// more than a person needs and far less than a script paging the dataset.
const SEARCHES_PER_MINUTE = 60;

/**
 * Paged city search for the explorer and city pickers. Returns at most
 * MAX_PAGE_SIZE rows per request, never the whole dataset.
 */
export async function GET(req: NextRequest) {
  const wait = limit(`search:${clientIp(req.headers)}`, SEARCHES_PER_MINUTE);
  if (wait > 0) {
    return NextResponse.json(
      { error: "Too many searches. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(wait), "Cache-Control": "no-store" } },
    );
  }
  try {
    const params = parseSearchParams(req.nextUrl.searchParams);
    const cities = await getAllCities();
    if (cities.length === 0) {
      return NextResponse.json({ error: "City data unavailable" }, { status: 502 });
    }
    const result = searchCities(cities.map(toSummary), params);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/search] caught error:", message);
    return NextResponse.json({ error: "Failed to search cities" }, { status: 502 });
  }
}
