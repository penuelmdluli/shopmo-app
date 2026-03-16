"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Eye, MapPin, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/types/database";

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  total: number;
  shipping_tracking_number: string | null;
  items: { id: string }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Find customer record
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!customer) {
          setLoading(false);
          return;
        }

        // Fetch orders with item count
        const { data, error } = await supabase
          .from("customer_orders")
          .select("id, order_number, created_at, status, total, shipping_tracking_number, items:customer_order_items(id)")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data as unknown as OrderRow[]);
        }
      } catch (err) {
        console.error("[Account/Orders] Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Loading orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-sm text-gray-500 mb-6">
          When you place your first order, it will appear here.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Order History</h2>

      {orders.map((order) => {
        const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
        const itemCount = order.items?.length || 0;
        return (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Order #{order.order_number}
                </p>
                <p className="text-xs text-gray-500">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                  statusInfo.color
                )}
              >
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {order.shipping_tracking_number && (
                  <Link
                    href={`/track?order=${order.order_number}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <MapPin size={14} />
                    Track
                  </Link>
                )}
                <Link
                  href={`/orders/${order.order_number}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye size={14} />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
