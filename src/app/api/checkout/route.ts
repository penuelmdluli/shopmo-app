import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkoutItemSchema = z.object({
  listing_id: z.string().min(1),
  quantity: z.number().int().min(1),
  unit_price: z.number().positive(),
});

const addressSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(1),
  street_address: z.string().min(1),
  suburb: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().default("South Africa"),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
  address: addressSchema,
  shipping_method: z.string().min(1),
  payment_method: z.enum(["card", "eft", "ozow", "payfast", "cash_on_delivery"]),
  coupon_code: z.string().optional(),
});

function generateOrderNumber(): string {
  const prefix = "SM";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, address, shipping_method, payment_method, coupon_code } = parsed.data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    // Mock shipping cost based on method
    const shippingCosts: Record<string, number> = {
      "bob_go_standard": 65,
      "bob_go_express": 99,
      "the_courier_guy": 85,
      "pargo_pickup": 45,
      "aramex_international": 199,
    };
    const shipping_cost = shippingCosts[shipping_method] || 65;

    // Mock coupon discount
    let discount_amount = 0;
    if (coupon_code) {
      switch (coupon_code.toUpperCase()) {
        case "WELCOME10":
          if (subtotal >= 200) discount_amount = subtotal * 0.1;
          break;
        case "SHOPMO50":
          if (subtotal >= 500) discount_amount = 50;
          break;
        case "FREESHIP":
          if (subtotal >= 300) discount_amount = shipping_cost;
          break;
      }
    }

    const after_discount = subtotal - discount_amount + shipping_cost;
    const vat_amount = Math.round(after_discount * 0.15 * 100) / 100;
    const total = Math.round((after_discount + vat_amount) * 100) / 100;

    const order_number = generateOrderNumber();

    return NextResponse.json({
      success: true,
      order: {
        order_number,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping_cost,
        discount_amount: Math.round(discount_amount * 100) / 100,
        vat_amount,
        total,
        currency: "ZAR",
        status: "pending_payment",
        payment_method,
        shipping_method,
        shipping_address: address,
        items: items.map((item) => ({
          ...item,
          total_price: Math.round(item.unit_price * item.quantity * 100) / 100,
        })),
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
