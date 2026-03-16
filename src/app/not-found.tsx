import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <span className="text-4xl font-bold text-[#0891b2]">ShopMO</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <p className="text-7xl font-bold text-[#0891b2] mb-2">404</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <form action="/search" method="GET" className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="Search for products..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0891b2] text-white rounded-lg font-medium hover:bg-[#0e7490] transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">Browse categories</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#0891b2] hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
