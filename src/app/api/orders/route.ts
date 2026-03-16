import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders, getOrderByNumber } from "@/lib/supabase/queries";

/**
 * GET /api/orders — Fetch ShopMO customer orders.
 * Used by SellBot dashboard to see ShopMO orders.
 *
 * Query params:
 *   - order_number: Get a specific order
 *   - limit: Max number of orders (default 50)
 *   - status: Filter by status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order_number");
  const limit = parseInt(searchParams.get("limit") || "50");

  if (orderNumber) {
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  }

  const orders = await getCustomerOrders(limit);

  return NextResponse.json({
    orders,
    total: orders.length,
    platform: "shopmo",
  });
}
