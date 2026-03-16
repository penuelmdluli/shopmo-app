import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { createShipment, mapServiceCode } from "@/lib/shipping/courier-guy";

const bookingSchema = z.object({
  order_number: z.string().min(1, "Order number is required"),
  service_level: z.string().default("ECO"),
  parcels: z.array(z.object({
    submitted_length_cm: z.number().default(30),
    submitted_width_cm: z.number().default(20),
    submitted_height_cm: z.number().default(15),
    submitted_weight_kg: z.number().default(2),
  })).optional(),
});

/**
 * POST /api/shipping/book — Book a courier shipment for a customer order
 * Uses The Courier Guy as priority #1 courier
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { order_number, service_level, parcels } = parsed.data;
    const supabase = await createServiceClient();

    // Fetch the order from database
    const { data: order, error: orderError } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("order_number", order_number)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found", order_number },
        { status: 404 }
      );
    }

    // Order must be paid before shipping
    if (order.payment_status !== "paid" && order.status !== "paid" && order.status !== "processing") {
      return NextResponse.json(
        { error: "Order must be paid before booking shipment", current_status: order.status, payment_status: order.payment_status },
        { status: 400 }
      );
    }

    // Already shipped?
    if (order.shipping_tracking_number) {
      return NextResponse.json(
        { error: "Shipment already booked", tracking_number: order.shipping_tracking_number },
        { status: 409 }
      );
    }

    // Extract shipping address from snapshot
    const address = order.shipping_address_snapshot as {
      full_name: string;
      phone: string;
      street_address: string;
      suburb?: string;
      city: string;
      province: string;
      postal_code: string;
      country?: string;
    } | null;

    if (!address) {
      return NextResponse.json(
        { error: "No shipping address on order" },
        { status: 400 }
      );
    }

    // Map the service level
    const serviceCode = mapServiceCode(service_level);

    // Check if Courier Guy API key is configured
    if (!process.env.COURIER_GUY_API_KEY) {
      // Return a mock response for development
      const mockTrackingNumber = `TCG-${Date.now().toString(36).toUpperCase()}`;

      // Update the order with mock tracking
      await supabase
        .from("customer_orders")
        .update({
          status: "shipped",
          shipping_provider: "The Courier Guy",
          shipping_tracking_number: mockTrackingNumber,
          shipping_estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("order_number", order_number);

      // Also update SellBot orders table
      await supabase
        .from("orders")
        .update({
          status: "shipped",
          tracking_number: mockTrackingNumber,
        })
        .eq("platform_order_id", order_number)
        .eq("platform", "shopmo");

      return NextResponse.json({
        success: true,
        provider: "The Courier Guy",
        tracking_number: mockTrackingNumber,
        service_level: serviceCode,
        status: "booked",
        message: "Shipment booked (sandbox mode - COURIER_GUY_API_KEY not set)",
        order_number,
      });
    }

    // LIVE: Book with The Courier Guy API
    try {
      const shipment = await createShipment(
        order_number,
        address,
        serviceCode,
        parcels || [{ submitted_length_cm: 30, submitted_width_cm: 20, submitted_height_cm: 15, submitted_weight_kg: 2 }]
      );

      const trackingNumber = shipment.tracking_reference || shipment.short_tracking_reference;

      // Update customer_orders with tracking info
      await supabase
        .from("customer_orders")
        .update({
          status: "shipped",
          shipping_provider: "The Courier Guy",
          shipping_tracking_number: trackingNumber,
          shipping_estimated_delivery: null, // Will be updated from tracking API
        })
        .eq("order_number", order_number);

      // Also update SellBot orders table
      await supabase
        .from("orders")
        .update({
          status: "shipped",
          tracking_number: trackingNumber,
          fulfillment_method: "courier_guy",
        })
        .eq("platform_order_id", order_number)
        .eq("platform", "shopmo");

      // Update order items status
      await supabase
        .from("customer_order_items")
        .update({ status: "shipped" })
        .eq("customer_order_id", order.id);

      return NextResponse.json({
        success: true,
        provider: "The Courier Guy",
        shipment_id: shipment.id,
        tracking_number: trackingNumber,
        service_level: serviceCode,
        status: "booked",
        parcels: shipment.parcels?.map(p => ({
          description: p.parcel_description,
          tracking: p.tracking_reference,
          waybill: p.waybill_number,
        })),
        order_number,
      });
    } catch (err) {
      console.error("[Shipping] Courier Guy booking failed:", err);
      return NextResponse.json(
        { error: "Failed to book courier", details: String(err) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Shipping] Error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
