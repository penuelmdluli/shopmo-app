import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description: "ShopMO returns policy. 30-day returns on most items. Learn how to return products and get refunds.",
};

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
        <ArrowLeft size={16} /> Back to Help Centre
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Refunds Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: March 2026</p>

      <div className="space-y-8">
        {/* Key Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <Clock size={24} className="mx-auto text-green-600 mb-2" />
            <p className="font-semibold text-gray-900">30-Day Returns</p>
            <p className="text-xs text-gray-500">From date of delivery</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <RotateCcw size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="font-semibold text-gray-900">Free Returns</p>
            <p className="text-xs text-gray-500">On qualifying items</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <CheckCircle size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="font-semibold text-gray-900">Quick Refunds</p>
            <p className="text-xs text-gray-500">5-7 business days</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Eligibility</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Items must be returned within 30 days of delivery</li>
            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Products must be unused, in original packaging with all tags</li>
            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> Proof of purchase (order number or receipt) required</li>
            <li className="flex items-start gap-2"><AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" /> Hygiene-sealed items (earbuds, beauty products) cannot be returned if seal is broken</li>
            <li className="flex items-start gap-2"><AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" /> Gift cards and digital products are non-refundable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Return</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3"><span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> Email us at <a href="mailto:support@shopmoo.co.za" className="text-primary hover:underline">support@shopmoo.co.za</a> with your order number and reason for return</li>
            <li className="flex gap-3"><span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> We will send you a return shipping label via email within 24 hours</li>
            <li className="flex gap-3"><span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> Pack the item securely and drop it off at your nearest Courier Guy / Pargo point</li>
            <li className="flex gap-3"><span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> Refund processed within 5-7 business days after we receive the item</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Defective Items</h2>
          <p className="text-sm text-gray-600">If you received a defective or damaged product, contact us within 7 days of delivery. We will arrange a free collection and send a replacement or full refund. As per the Consumer Protection Act (CPA), you are entitled to a refund, replacement, or repair for defective goods within 6 months of purchase.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Methods</h2>
          <p className="text-sm text-gray-600">Refunds are issued to the original payment method. Card refunds may take 5-7 business days to appear on your statement. EFT refunds are processed within 3 business days.</p>
        </section>

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Need help with a return?</p>
          <a href="mailto:support@shopmoo.co.za" className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
