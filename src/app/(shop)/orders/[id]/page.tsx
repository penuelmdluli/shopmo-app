import type { Metadata } from "next";
import Link from "next/link";
import {
  Package, CheckCircle, Truck, MapPin, Clock, ChevronRight,
  CreditCard, HelpCircle, ArrowLeft,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getListings } from "@/lib/supabase/queries";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your ShopMO order details, tracking status, and delivery information.",
};

// Mock order data — will be replaced by Supabase queries
async function getMockOrder(id: string, listings: Awaited<ReturnType<typeof getListings>>) {
  const items = listings.slice(0, 2);
  return {
    id,
    order_number: `SM-20260316-${id.toUpperCase().padStart(5, "0")}`,
    status: "shipped" as const,
    created_at: "16 March 2026, 10:24",
    payment_method: "Yoco (Visa ending 6411)",
    subtotal: items.reduce((sum, item) => sum + item.current_price, 0),
    shipping: 0,
    discount: 0,
    vat: items.reduce((sum, item) => sum + item.current_price, 0) * 0.15,
    total: items.reduce((sum, item) => sum + item.current_price, 0),
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      image: item.images?.[0] || "",
      price: item.current_price,
      quantity: 1,
      sku: item.sku,
    })),
    shipping_address: {
      name: "Sabelo Mdluli",
      line1: "123 Pretoria Street",
      line2: "Hatfield",
      city: "Pretoria",
      province: "Gauteng",
      postal_code: "0028",
      phone: "079 257 2466",
    },
    tracking: {
      number: "TCG987654321",
      courier: "The Courier Guy",
      estimated_delivery: "19 March 2026",
    },
    timeline: [
      { status: "Order Placed", date: "16 March 2026, 10:24", description: "Your order has been placed and confirmed.", complete: true },
      { status: "Payment Confirmed", date: "16 March 2026, 10:25", description: "Payment received via Yoco.", complete: true },
      { status: "Processing", date: "16 March 2026, 14:00", description: "Your order is being packed and prepared for shipping.", complete: true },
      { status: "Shipped", date: "17 March 2026, 09:30", description: "Tracking: TCG987654321 via The Courier Guy.", complete: true },
      { status: "Out for Delivery", date: "", description: "Your parcel is on its way to you.", complete: false },
      { status: "Delivered", date: "", description: "", complete: false },
    ],
  };
}

const timelineIcons = [Package, CheckCircle, Clock, Truck, MapPin, CheckCircle];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending_payment: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Payment" },
  paid: { bg: "bg-blue-100", text: "text-blue-700", label: "Paid" },
  processing: { bg: "bg-orange-100", text: "text-orange-700", label: "Processing" },
  shipped: { bg: "bg-primary/10", text: "text-primary", label: "Shipped" },
  delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const listings = await getListings();
  const order = await getMockOrder(id, listings);
  const statusStyle = statusColors[order.status] || statusColors.processing;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10">
      {/* Back + Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/products" className="text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <nav className="flex items-center gap-1 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Order {order.order_number}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {order.created_at}</p>
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
              <h2 className="font-semibold text-gray-900">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <Link href={`/products/${item.slug}`} className="shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="p-5">
              {order.tracking.number && (
                <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm flex items-center gap-2">
                  <Truck size={16} className="text-primary shrink-0" />
                  <span className="text-gray-500">Tracking:</span>
                  <span className="font-medium text-gray-900">{order.tracking.number}</span>
                  <span className="text-gray-400">via</span>
                  <span className="font-medium text-gray-900">{order.tracking.courier}</span>
                </div>
              )}
              <div className="space-y-0">
                {order.timeline.map((step, i) => {
                  const Icon = timelineIcons[i] || Package;
                  const isLast = i === order.timeline.length - 1;
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
                        {step.date && <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>}
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
                <span className="text-green-600 font-medium">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">VAT (15%)</span>
                <span className="text-gray-900">{formatCurrency(order.vat)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <CreditCard size={14} className="text-gray-400" />
              {order.payment_method}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.province}</p>
              <p>{order.shipping_address.postal_code}</p>
              <p className="text-gray-500 mt-1">{order.shipping_address.phone}</p>
            </div>
            {order.tracking.estimated_delivery && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-sm">
                <Truck size={16} className="text-primary" />
                <span className="text-gray-500">Est. delivery:</span>
                <span className="font-medium text-gray-900">{order.tracking.estimated_delivery}</span>
              </div>
            )}
          </div>

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
