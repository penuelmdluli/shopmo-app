import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package, CheckCircle, Truck, MapPin, Clock, ChevronRight,
  CreditCard, HelpCircle, ArrowLeft,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getOrderByNumber } from "@/lib/supabase/queries";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your ShopMO order details, tracking status, and delivery information.",
};

const timelineIcons = [Package, CheckCircle, Clock, Truck, MapPin, CheckCircle];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending_payment: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Payment" },
  paid: { bg: "bg-blue-100", text: "text-blue-700", label: "Paid" },
  processing: { bg: "bg-orange-100", text: "text-orange-700", label: "Processing" },
  shipped: { bg: "bg-primary/10", text: "text-primary", label: "Shipped" },
  out_for_delivery: { bg: "bg-blue-100", text: "text-blue-700", label: "Out for Delivery" },
  delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  refunded: { bg: "bg-gray-100", text: "text-gray-700", label: "Refunded" },
};

function buildTimeline(order: NonNullable<Awaited<ReturnType<typeof getOrderByNumber>>>) {
  const status = order.status;
  const statuses = ["pending_payment", "paid", "processing", "shipped", "out_for_delivery", "delivered"];
  const statusIndex = statuses.indexOf(status);

  return [
    {
      status: "Order Placed",
      description: "Your order has been placed and confirmed.",
      date: order.created_at,
      complete: true,
    },
    {
      status: "Payment Confirmed",
      description: order.payment_method ? `Payment via ${order.payment_method}` : "Payment received.",
      date: order.paid_at || (statusIndex >= 1 ? order.updated_at : null),
      complete: statusIndex >= 1,
    },
    {
      status: "Processing",
      description: "Your order is being packed and prepared for shipping.",
      date: statusIndex >= 2 ? order.updated_at : null,
      complete: statusIndex >= 2,
    },
    {
      status: "Shipped",
      description: order.shipping_tracking_number
        ? `Tracking: ${order.shipping_tracking_number} via ${order.shipping_provider || "courier"}`
        : "Shipped with courier.",
      date: statusIndex >= 3 ? order.updated_at : null,
      complete: statusIndex >= 3,
    },
    {
      status: "Out for Delivery",
      description: "Your parcel is on its way to you.",
      date: statusIndex >= 4 ? order.updated_at : null,
      complete: statusIndex >= 4,
    },
    {
      status: "Delivered",
      description: "Delivered successfully.",
      date: statusIndex >= 5 ? order.updated_at : null,
      complete: statusIndex >= 5,
    },
  ];
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  // id is the order_number (e.g. SM-20260316-XXXXX)
  const order = await getOrderByNumber(id);

  if (!order) {
    notFound();
  }

  const statusStyle = statusColors[order.status] || statusColors.processing;
  const timeline = buildTimeline(order);
  const items = order.items || [];
  const shippingAddress = order.shipping_address_snapshot as {
    full_name?: string;
    phone?: string;
    street_address?: string;
    suburb?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  } | null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
      {/* Back + Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/account/orders" className="text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <nav className="flex items-center gap-1 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/account/orders" className="hover:text-primary transition-colors">Orders</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Order {order.order_number}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        <span className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium w-fit", statusStyle.bg, statusStyle.text)}>
          {statusStyle.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Order Items + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <div className="shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.product_name}
                    </p>
                    {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-5 text-center text-sm text-gray-400">
                  No items found for this order.
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-5">
              {order.shipping_tracking_number && (
                <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm flex items-center gap-2">
                  <Truck size={16} className="text-primary shrink-0" />
                  <span className="text-gray-500">Tracking:</span>
                  <span className="font-medium text-gray-900">{order.shipping_tracking_number}</span>
                  <span className="text-gray-400">via</span>
                  <span className="font-medium text-gray-900">{order.shipping_provider || "The Courier Guy"}</span>
                </div>
              )}
              <div className="space-y-0">
                {timeline.map((step, i) => {
                  const Icon = timelineIcons[i] || Package;
                  const isLast = i === timeline.length - 1;
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          step.complete ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          <Icon size={16} />
                        </div>
                        {!isLast && (
                          <div className={cn("w-0.5 h-10", step.complete ? "bg-primary" : "bg-gray-200")} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={cn("text-sm font-medium", step.complete ? "text-gray-900" : "text-gray-400")}>
                          {step.status}
                        </p>
                        {step.date && <p className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</p>}
                        {step.description && <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Summary + Shipping + Help */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">{order.shipping_cost === 0 ? "Free" : formatCurrency(order.shipping_cost)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">VAT (15%)</span>
                <span className="text-gray-900">{formatCurrency(order.vat_amount)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
            {order.payment_method && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <CreditCard size={14} className="text-gray-400" />
                Paid via {order.payment_method}
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                {shippingAddress.full_name && <p className="font-medium text-gray-900">{shippingAddress.full_name}</p>}
                {shippingAddress.street_address && <p>{shippingAddress.street_address}</p>}
                {shippingAddress.suburb && <p>{shippingAddress.suburb}</p>}
                <p>{shippingAddress.city}, {shippingAddress.province}</p>
                {shippingAddress.postal_code && <p>{shippingAddress.postal_code}</p>}
                {shippingAddress.phone && <p className="text-gray-500 mt-1">{shippingAddress.phone}</p>}
              </div>
              {order.shipping_estimated_delivery && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-sm">
                  <Truck size={16} className="text-primary" />
                  <span className="text-gray-500">Est. delivery:</span>
                  <span className="font-medium text-gray-900">{formatDate(order.shipping_estimated_delivery)}</span>
                </div>
              )}
            </div>
          )}

          {/* Help */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Need Help?</h2>
            <div className="space-y-2">
              <Link
                href="/help"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <HelpCircle size={16} />
                Help Centre
              </Link>
              <Link
                href="/help/returns-policy"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Package size={16} />
                Return This Order
              </Link>
              <a
                href="mailto:support@shopmoo.co.za"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <CheckCircle size={16} />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
