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
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
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
