import { NextResponse, type NextRequest } from "next/server";
import { getAllCities, toSummary } from "@/lib/cities";
import { parseSearchParams, searchCities } from "@/lib/search";

/**
 * Paged city search for the explorer and city pickers. Returns at most
 * MAX_PAGE_SIZE rows per request, never the whole dataset.
 */
export async function GET(req: NextRequest) {
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
