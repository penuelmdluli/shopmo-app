import { NextRequest, NextResponse } from "next/server";
import { searchListings } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Search query 'q' is required" },
      { status: 400 }
    );
  }

  const results = await searchListings(q.trim());

  // Sort by relevance: exact title match first, then by rating
  const query = q.toLowerCase().trim();
  results.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
    const bTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
    if (aTitle !== bTitle) return bTitle - aTitle;
    return b.rating_average - a.rating_average;
  });

  return NextResponse.json({
    query: q,
    results,
    count: results.length,
  });
}
