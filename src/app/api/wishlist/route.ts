import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const wishlistItemSchema = z.object({
  listing_id: z.string().min(1, "listing_id is required"),
});

export async function GET() {
  // Return empty wishlist for now (will integrate with Supabase later)
  return NextResponse.json({
    items: [],
    count: 0,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = wishlistItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item added to wishlist",
      item: {
        listing_id: parsed.data.listing_id,
        created_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = wishlistItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist",
      listing_id: parsed.data.listing_id,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
