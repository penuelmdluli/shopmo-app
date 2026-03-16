import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-gray-100 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search size={48} className="text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
          >
            <ShoppingBag size={18} />
            Browse Products
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Electronics", slug: "electronics" },
              { name: "Home & Kitchen", slug: "home-kitchen" },
              { name: "Fashion", slug: "fashion" },
              { name: "Beauty & Health", slug: "beauty-health" },
              { name: "Sports & Outdoors", slug: "sports-outdoors" },
              { name: "Toys & Games", slug: "toys-games" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-primary transition-colors group"
              >
                {cat.name}
                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
