"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "SM-00000000-XXXXX";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-2">Thank you for shopping with ShopMO.</p>
      <p className="text-sm text-gray-500 mb-6">
        Your order number is{" "}
        <span className="font-semibold text-gray-900">{orderNumber}</span>
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">What happens next?</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
            We&apos;ll send a confirmation email with your order details.
          </li>
          <li className="flex items-start gap-2">
            <Package size={16} className="text-primary mt-0.5 shrink-0" />
            Once shipped, you&apos;ll receive tracking information via email and SMS.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/track?order=${orderNumber}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Package size={18} />
          Track Order
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
