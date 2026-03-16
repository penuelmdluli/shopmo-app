import type { Metadata } from "next";
import Link from "next/link";
import { Search, Package, RotateCcw, CreditCard, User, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Centre",
  description: "Get help with your ShopMO orders, deliveries, returns, payments, and account. Contact our support team.",
};

const helpCategories = [
  {
    icon: Package,
    title: "Orders & Delivery",
    description: "Track orders, delivery times, shipping info",
    href: "/help/orders",
  },
  {
    icon: RotateCcw,
    title: "Returns & Refunds",
    description: "Return policy, how to return, refund status",
    href: "/help/returns",
  },
  {
    icon: CreditCard,
    title: "Payment",
    description: "Payment methods, failed payments, invoices",
    href: "/help/payment",
  },
  {
    icon: User,
    title: "Account",
    description: "Profile, password, security, preferences",
    href: "/help/account",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Help Centre</h1>
        <p className="text-gray-500 mb-6">How can we help you today?</p>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help topics..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {helpCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon size={24} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{cat.title}</h2>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Contact Us */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Still Need Help?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Our support team is available Monday to Friday, 8am - 5pm.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:support@shopmoo.co.za"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Mail size={18} />
            support@shopmoo.co.za
          </a>
          <a
            href="/contact"
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
          >
            <Mail size={18} />
            Contact Form
          </a>
        </div>
      </div>
    </div>
  );
}
