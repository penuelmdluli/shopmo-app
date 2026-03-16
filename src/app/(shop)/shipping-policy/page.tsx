import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Truck, MapPin, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "ShopMO shipping info. Free delivery on orders over R500. Standard, express, and same-day options across South Africa.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
        <ArrowLeft size={16} /> Back to Help Centre
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: March 2026</p>

      <div className="space-y-8">
        {/* Free Shipping Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-cyan-50 rounded-xl p-6 text-center">
          <Truck size={32} className="mx-auto text-primary mb-2" />
          <p className="text-lg font-bold text-gray-900">Free Delivery on Orders Over R500</p>
          <p className="text-sm text-gray-500">Standard delivery across South Africa</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Options</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Method</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Timeframe</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="px-4 py-3">Standard Delivery</td><td className="px-4 py-3">3-5 business days</td><td className="px-4 py-3 text-right">R65 (free over R500)</td></tr>
                <tr><td className="px-4 py-3">Express Delivery</td><td className="px-4 py-3">1-2 business days</td><td className="px-4 py-3 text-right">R99</td></tr>
                <tr><td className="px-4 py-3">Same Day (Gauteng)</td><td className="px-4 py-3">Same day if ordered before 12pm</td><td className="px-4 py-3 text-right">R149</td></tr>
                <tr><td className="px-4 py-3">Pargo Pickup Point</td><td className="px-4 py-3">3-5 business days</td><td className="px-4 py-3 text-right">R45</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-start gap-2"><MapPin size={16} className="text-primary mt-0.5 shrink-0" /> All 9 provinces in South Africa</div>
            <div className="flex items-start gap-2"><Clock size={16} className="text-primary mt-0.5 shrink-0" /> Major metros: 1-3 days typical</div>
            <div className="flex items-start gap-2"><MapPin size={16} className="text-primary mt-0.5 shrink-0" /> Rural areas may take 5-7 days</div>
            <div className="flex items-start gap-2"><Shield size={16} className="text-primary mt-0.5 shrink-0" /> All shipments are insured</div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tracking Your Order</h2>
          <p className="text-sm text-gray-600 mb-3">Once your order ships, you will receive a tracking number via email. You can track your delivery at any time on our <Link href="/track" className="text-primary hover:underline">order tracking page</Link>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Partners</h2>
          <p className="text-sm text-gray-600">We partner with The Courier Guy and Pargo to ensure reliable delivery across South Africa. Our courier partners are vetted and provide door-to-door service with signature confirmation.</p>
        </section>

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Questions about delivery?</p>
          <a href="mailto:support@shopmoo.co.za" className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
