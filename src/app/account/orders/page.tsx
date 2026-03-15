"use client";

import Link from "next/link";
import { Package, Eye, MapPin } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/types/database";

const mockOrders = [
  {
    id: "1",
    order_number: "SM-20260310-A1B2C",
    created_at: "2026-03-10T14:30:00Z",
    status: "shipped" as OrderStatus,
    total: 1249.0,
    item_count: 3,
    tracking_number: "TCG123456789",
  },
  {
    id: "2",
    order_number: "SM-20260305-D3E4F",
    created_at: "2026-03-05T09:15:00Z",
    status: "delivered" as OrderStatus,
    total: 495.0,
    item_count: 1,
    tracking_number: "TCG987654321",
  },
  {
    id: "3",
    order_number: "SM-20260228-G5H6I",
    created_at: "2026-02-28T16:45:00Z",
    status: "processing" as OrderStatus,
    total: 2150.0,
    item_count: 5,
    tracking_number: null,
  },
];

export default function OrdersPage() {
  if (mockOrders.length === 0) {
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

      {mockOrders.map((order) => {
        const statusInfo = ORDER_STATUSES[order.status];
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
                <span>{order.item_count} item{order.item_count > 1 ? "s" : ""}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {order.tracking_number && (
                  <Link
                    href={`/track?order=${order.order_number}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <MapPin size={14} />
                    Track
                  </Link>
                )}
                <Link
                  href={`/orders/${order.id}`}
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
