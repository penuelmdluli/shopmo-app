import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import { MOCK_DEALS, MOCK_LISTINGS } from "@/lib/mock-data";
import { DealsSection } from "@/components/home/deals-section";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata = {
  title: "Deals & Specials",
  description: "Shop the best deals and flash sales. Save big on trending products.",
};

export default function DealsPage() {
  const discountedProducts = MOCK_LISTINGS.filter(
    (l) => l.original_price && l.original_price > l.current_price
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Deals</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Flame size={28} className="text-secondary" />
        Today&apos;s Best Deals
      </h1>
      <p className="text-muted-foreground mb-8">
        Limited-time offers with massive savings. Grab them before they&apos;re gone!
      </p>

      {/* Flash Deals */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Flash Sales - Ending Soon
        </h2>
        <DealsSection deals={MOCK_DEALS} />
      </div>

      {/* All Discounted Products */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          All Products on Sale ({discountedProducts.length})
        </h2>
        <ProductGrid listings={discountedProducts} />
      </div>
    </div>
  );
}
