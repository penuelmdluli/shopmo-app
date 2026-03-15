"use client";

import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { StorefrontListing } from "@/types/database";

interface ProductGridProps {
  listings: StorefrontListing[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({ listings, columns = 4, className }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {listings.map((listing) => (
        <ProductCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
