import Link from "next/link";
import { ChevronRight, Gift, ShieldCheck, Clock, CreditCard } from "lucide-react";
import { GiftCardSection } from "@/components/engagement/gift-cards";

export const metadata = {
  title: "Gift Cards - ShopMO",
  description: "Send a ShopMO gift card to someone special. Available from R50 to R5,000. Never expires.",
};

const BENEFITS = [
  { icon: Gift, title: "Instant Delivery", desc: "Sent directly to their email inbox" },
  { icon: Clock, title: "Never Expires", desc: "Use anytime, no rush" },
  { icon: CreditCard, title: "Any Amount", desc: "From R50 to R5,000" },
  { icon: ShieldCheck, title: "Secure", desc: "Unique code, one-time use" },
];

export default function GiftCardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Gift Cards</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ShopMO Gift Cards</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          The perfect gift for anyone. Let them choose from thousands of trending products.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {BENEFITS.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gift Card Purchase Form */}
      <GiftCardSection />
    </div>
  );
}
