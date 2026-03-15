import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const validateSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().positive("Subtotal must be positive"),
});

interface MockCoupon {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
}

const MOCK_COUPONS: MockCoupon[] = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    discount_type: "percentage",
    discount_value: 10,
    min_order_amount: 200,
    max_discount_amount: 500,
  },
  {
    code: "SHOPMO50",
    description: "R50 off orders over R500",
    discount_type: "fixed_amount",
    discount_value: 50,
    min_order_amount: 500,
    max_discount_amount: null,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders over R300",
    discount_type: "free_shipping",
    discount_value: 0,
    min_order_amount: 300,
    max_discount_amount: null,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;

    const coupon = MOCK_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order amount is R${coupon.min_order_amount}`,
        },
        { status: 400 }
      );
    }

    let discount_amount = 0;

    switch (coupon.discount_type) {
      case "percentage":
        discount_amount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount_amount) {
          discount_amount = Math.min(discount_amount, coupon.max_discount_amount);
        }
        break;
      case "fixed_amount":
        discount_amount = coupon.discount_value;
        break;
      case "free_shipping":
        discount_amount = 0; // Shipping discount handled at checkout
        break;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount_amount * 100) / 100,
        min_order_amount: coupon.min_order_amount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
