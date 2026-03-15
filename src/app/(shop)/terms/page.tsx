import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ShopMO's terms of service. Read about orders, pricing, shipping, returns, payments, and your rights.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            By accessing and using ShopMO (&quot;the Platform&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Account Registration</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            To make purchases, you must create an account with accurate and complete information.
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Orders and Pricing</h2>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>All prices are listed in South African Rand (ZAR) and include VAT unless stated otherwise.</li>
            <li>We reserve the right to modify prices at any time without prior notice.</li>
            <li>An order is confirmed once payment has been successfully processed.</li>
            <li>We reserve the right to cancel orders in cases of pricing errors or stock unavailability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Shipping and Delivery</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We deliver to addresses across South Africa through our logistics partners. Delivery
            times are estimates and may vary depending on your location and chosen shipping method.
            Free delivery is available on orders over R500 (excluding same-day delivery).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Returns and Refunds</h2>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>You may return most items within 30 days of delivery for a full refund.</li>
            <li>Items must be unused, in original packaging, and in resalable condition.</li>
            <li>Certain items such as perishables, personal care products, and undergarments are not eligible for return.</li>
            <li>Refunds are processed within 5-10 business days to your original payment method.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payment</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We accept payments via PayFast (credit card, debit card, EFT, SnapScan) and Ozow
            (instant EFT). All payment transactions are processed securely through PCI-compliant
            payment gateways. ShopMO does not store your credit card information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            All content on the Platform, including text, images, logos, and software, is the
            property of ShopMO or its licensors and is protected by South African intellectual
            property laws. You may not reproduce, distribute, or create derivative works without
            our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            ShopMO shall not be liable for any indirect, incidental, or consequential damages
            arising from your use of the Platform. Our total liability shall not exceed the amount
            you paid for the product or service in question.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            These Terms of Service are governed by the laws of the Republic of South Africa.
            Any disputes shall be resolved in the courts of Gauteng, Pretoria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:support@shopmoo.co.za" className="text-primary hover:underline">
              support@shopmoo.co.za
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
