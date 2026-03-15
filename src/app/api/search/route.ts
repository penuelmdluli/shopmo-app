import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Search query 'q' is required" },
      { status: 400 }
    );
  }

  const query = q.toLowerCase().trim();
  const terms = query.split(/\s+/);

  const results = MOCK_LISTINGS.filter((listing) => {
    const searchable = [
      listing.title,
      listing.description,
      listing.category,
      ...listing.tags,
      listing.brand || "",
      listing.sku,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchable.includes(term));
  });

  // Sort by relevance: exact title match first, then by rating
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
