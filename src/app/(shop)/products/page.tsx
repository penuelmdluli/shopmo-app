import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getListings, getCategories } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductsFilterBar } from "@/components/products/products-filter-bar";

export const metadata = {
  title: "All Products",
  description: "Browse our full product catalogue. Trending electronics, home goods, fashion and more.",
};

export default async function ProductsPage() {
  const [listings, categories] = await Promise.all([
    getListings(),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">All Products</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{listings.length} products found</p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/products"
          className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-full"
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Filter Bar */}
      <ProductsFilterBar />

      {/* Product Grid */}
      <ProductGrid listings={listings} />
    </div>
  );
}
