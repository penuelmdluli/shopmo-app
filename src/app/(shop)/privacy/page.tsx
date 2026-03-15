export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            ShopMO (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your personal information and your right to privacy. This Privacy Policy describes how
            we collect, use, store, and share your information when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Name, email address, phone number, and delivery address</li>
            <li>Payment information (processed securely via PayFast and Ozow)</li>
            <li>Order history and product preferences</li>
            <li>Communications you send to us</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Process and fulfil your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Personalize your shopping experience</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our services and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction. All
            payment transactions are processed through PCI-compliant payment gateways.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights (POPIA)</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Under the Protection of Personal Information Act (POPIA), you have the right to access,
            correct, or delete your personal information. You may also object to the processing of
            your data or withdraw consent for marketing communications at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience, analyze
            site traffic, and personalize content. You can manage your cookie preferences through
            your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your rights,
            please contact us at{" "}
            <a href="mailto:support@shopmo.co.za" className="text-primary hover:underline">
              support@shopmo.co.za
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
