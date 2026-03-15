import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addItemSchema = z.object({
  listing_id: z.string().min(1, "listing_id is required"),
  quantity: z.number().int().min(1).max(100),
});

const updateItemSchema = z.object({
  listing_id: z.string().min(1, "listing_id is required"),
  quantity: z.number().int().min(1).max(100),
});

const removeItemSchema = z.object({
  listing_id: z.string().min(1, "listing_id is required"),
});

export async function GET() {
  // Return empty cart for now (will integrate with Supabase later)
  return NextResponse.json({
    cart: {
      id: null,
      items: [],
      subtotal: 0,
      item_count: 0,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { listing_id, quantity } = parsed.data;

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      item: {
        listing_id,
        quantity,
        added_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { listing_id, quantity } = parsed.data;

    return NextResponse.json({
      success: true,
      message: "Cart item updated",
      item: {
        listing_id,
        quantity,
        updated_at: new Date().toISOString(),
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
    const parsed = removeItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      listing_id: parsed.data.listing_id,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
