import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your ShopMO order has been placed successfully. View your order details and tracking information.",
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center"><p>Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
