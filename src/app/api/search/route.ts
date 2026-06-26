import { NextResponse } from "next/server";
import { getAllCities } from "@/lib/cities";

export async function GET() {
  try {
    const cities = await getAllCities();

    return NextResponse.json(
      { data: cities },
      {
        headers: {
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
