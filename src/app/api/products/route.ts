import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

  let filtered = [...MOCK_LISTINGS];

  // Filter by category
  if (category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search term
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sort
  switch (sort) {
    case "price_asc":
      filtered.sort((a, b) => a.current_price - b.current_price);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.current_price - a.current_price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating_average - a.rating_average);
      break;
    case "popular":
      filtered.sort((a, b) => b.rating_count - a.rating_count);
      break;
    case "newest":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit);

  return NextResponse.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
