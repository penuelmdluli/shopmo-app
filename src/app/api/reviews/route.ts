import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MOCK_REVIEWS } from "@/lib/mock-data";

const createReviewSchema = z.object({
  listing_id: z.string().min(1, "listing_id is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  customer_order_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listing_id = searchParams.get("listing_id");

  if (!listing_id) {
    return NextResponse.json(
      { error: "listing_id query parameter is required" },
      { status: 400 }
    );
  }

  const reviews = MOCK_REVIEWS.filter((r) => r.listing_id === listing_id);

  const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

  return NextResponse.json({
    reviews,
    total: reviews.length,
    average_rating: Math.round(averageRating * 10) / 10,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const review = {
      id: `r${Date.now()}`,
      customer_id: "mock-customer",
      listing_id: parsed.data.listing_id,
      customer_order_id: parsed.data.customer_order_id || null,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body || null,
      images: parsed.data.images || [],
      is_verified_purchase: false,
      helpful_count: 0,
      status: "pending" as const,
      seller_response: null,
      seller_responded_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Review submitted for approval",
      review,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
