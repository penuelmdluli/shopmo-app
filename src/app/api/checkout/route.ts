import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const checkoutItemSchema = z.object({
  listing_id: z.string().min(1),
  quantity: z.number().int().min(1),
  unit_price: z.number().positive(),
  product_name: z.string().min(1),
  product_image: z.string().optional(),
  sku: z.string().optional(),
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
  guest_email: z.string().email().optional(),
  guest_name: z.string().optional(),
  guest_phone: z.string().optional(),
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

    const { items, address, shipping_method, payment_method, coupon_code, guest_email, guest_name, guest_phone } = parsed.data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    // Shipping cost based on method
    const shippingCosts: Record<string, number> = {
      "bob_go_standard": 65,
      "bob_go_express": 99,
      "the_courier_guy": 85,
      "pargo_pickup": 45,
      "aramex_international": 199,
      "free": 0,
    };
    const shipping_cost = subtotal >= 500 ? 0 : (shippingCosts[shipping_method] || 65);

    // Validate coupon from database
    let discount_amount = 0;
    const supabase = await createClient();

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;

        const isExpired = validUntil && now > validUntil;
        const notStarted = validFrom && now < validFrom;
        const usageFull = coupon.usage_limit && coupon.usage_count >= coupon.usage_limit;
        const meetsMinimum = subtotal >= (coupon.min_order_amount || 0);

        if (!isExpired && !notStarted && !usageFull && meetsMinimum) {
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
              discount_amount = shipping_cost;
              break;
          }
        }
      }
    }

    const after_discount = subtotal - discount_amount + shipping_cost;
    const vat_amount = Math.round(after_discount * 0.15 * 100) / 100;
    const total = Math.round((after_discount + vat_amount) * 100) / 100;

    const order_number = generateOrderNumber();

    // ============================================
    // PERSIST ORDER TO SUPABASE
    // ============================================

    const orderData = {
      order_number,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping_cost,
      discount_amount: Math.round(discount_amount * 100) / 100,
      vat_amount,
      total,
      currency: "ZAR",
      status: "pending_payment",
      payment_method,
      payment_status: "pending",
      shipping_method,
      shipping_address_snapshot: address,
      coupon_code: coupon_code?.toUpperCase() || null,
      guest_email: guest_email || null,
      guest_name: guest_name || address.full_name || null,
      guest_phone: guest_phone || address.phone || null,
    };

    const { data: savedOrder, error: orderError } = await supabase
      .from("customer_orders")
      .insert(orderData)
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("[Checkout] Failed to save order:", orderError);
      // Still return the order even if DB save fails (graceful degradation)
      return NextResponse.json({
        success: true,
        order: {
          ...orderData,
          id: null,
          items: items.map((item) => ({
            ...item,
            total_price: Math.round(item.unit_price * item.quantity * 100) / 100,
          })),
          created_at: new Date().toISOString(),
        },
        warning: "Order created but not saved to database",
      });
    }

    // Save order items
    const orderItems = items.map((item) => ({
      customer_order_id: savedOrder.id,
      listing_id: item.listing_id,
      product_name: item.product_name,
      product_image: item.product_image || null,
      sku: item.sku || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: Math.round(item.unit_price * item.quantity * 100) / 100,
      status: "pending",
    }));

    const { error: itemsError } = await supabase
      .from("customer_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[Checkout] Failed to save order items:", itemsError);
    }

    // Update coupon usage count if a coupon was applied
    if (coupon_code && discount_amount > 0) {
      try {
        const { data: currentCoupon } = await supabase
          .from("coupons")
          .select("usage_count")
          .eq("code", coupon_code.toUpperCase())
          .single();

        if (currentCoupon) {
          await supabase
            .from("coupons")
            .update({ usage_count: (currentCoupon.usage_count || 0) + 1 })
            .eq("code", coupon_code.toUpperCase());
        }
      } catch (err) {
        console.error("[Checkout] Failed to update coupon usage:", err);
      }
    }

    // Also create records in SellBot's orders table for seller visibility
    // Each listing belongs to a seller (user_id in listings table)
    for (const item of items) {
      try {
        // Find the listing's owner (seller)
        const { data: listing } = await supabase
          .from("listings")
          .select("user_id, product_id")
          .eq("id", item.listing_id)
          .single();

        if (listing?.user_id) {
          await supabase
            .from("orders")
            .insert({
              user_id: listing.user_id,
              listing_id: item.listing_id,
              product_id: listing.product_id || null,
              platform: "shopmo",
              platform_order_id: order_number,
              order_amount: Math.round(item.unit_price * item.quantity * 100) / 100,
              shipping_cost: shipping_cost,
              status: "new",
              payment_status: "pending",
            });
        }
      } catch (err) {
        console.error("[Checkout] Failed to create SellBot order:", err);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        items: items.map((item) => ({
          ...item,
          total_price: Math.round(item.unit_price * item.quantity * 100) / 100,
        })),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
