import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackShipment } from "@/lib/shipping/courier-guy";

/**
 * GET /api/shipping/track?order_number=SM-XXXXX
 * Track a shipment by order number
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order_number");
  const trackingNumber = searchParams.get("tracking_number");

  if (!orderNumber && !trackingNumber) {
    return NextResponse.json(
      { error: "order_number or tracking_number is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Find the order
  let tracking = trackingNumber;
  let orderData = null;

  if (orderNumber) {
    const { data: order } = await supabase
      .from("customer_orders")
      .select("order_number, status, shipping_provider, shipping_tracking_number, shipping_estimated_delivery, created_at, updated_at")
      .eq("order_number", orderNumber)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    tracking = order.shipping_tracking_number;
    orderData = order;
  }

  if (!tracking) {
    return NextResponse.json({
      order: orderData,
      tracking: null,
      message: "No tracking number assigned yet. Order is being processed.",
      timeline: [
        { status: "ordered", description: "Order placed", date: orderData?.created_at, completed: true },
        { status: "paid", description: "Payment confirmed", date: orderData?.updated_at, completed: orderData?.status !== "pending_payment" },
        { status: "processing", description: "Preparing for dispatch", date: null, completed: ["processing", "shipped", "out_for_delivery", "delivered"].includes(orderData?.status || "") },
        { status: "shipped", description: "Shipped with courier", date: null, completed: ["shipped", "out_for_delivery", "delivered"].includes(orderData?.status || "") },
        { status: "delivered", description: "Delivered", date: null, completed: orderData?.status === "delivered" },
      ],
    });
  }

  // If Courier Guy API key is configured, get live tracking
  if (process.env.COURIER_GUY_API_KEY) {
    try {
      const trackingData = await trackShipment(tracking);
      return NextResponse.json({
        order: orderData,
        tracking: {
          number: tracking,
          provider: orderData?.shipping_provider || "The Courier Guy",
          status: trackingData.status,
          events: trackingData.tracking_events,
        },
      });
    } catch (err) {
      console.error("[Tracking] Courier Guy API error:", err);
    }
  }

  // Fallback: return order status as timeline
  return NextResponse.json({
    order: orderData,
    tracking: {
      number: tracking,
      provider: orderData?.shipping_provider || "The Courier Guy",
      status: orderData?.status || "unknown",
      events: [],
    },
    timeline: [
      { status: "ordered", description: "Order placed", date: orderData?.created_at, completed: true },
      { status: "paid", description: "Payment confirmed", completed: true },
      { status: "processing", description: "Preparing for dispatch", completed: true },
      { status: "shipped", description: `Shipped via ${orderData?.shipping_provider || "courier"}`, completed: true, tracking_number: tracking },
      { status: "out_for_delivery", description: "Out for delivery", completed: orderData?.status === "out_for_delivery" || orderData?.status === "delivered" },
      { status: "delivered", description: "Delivered", completed: orderData?.status === "delivered" },
    ],
  });
}
