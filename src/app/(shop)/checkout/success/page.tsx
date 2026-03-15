import { Suspense } from "react";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center"><p>Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
