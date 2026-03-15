"use client";

import { useState } from "react";
import { LiveViewerCount, StockUrgency, BoughtCount } from "@/components/shared/social-proof";
import type { StorefrontListing } from "@/types/database";

interface ProductSocialProofProps {
  listing: StorefrontListing;
}

export function ProductSocialProof({ listing }: ProductSocialProofProps) {
  // useState initializer avoids impure Math.random in render
  const [boughtCount] = useState(() => listing.rating_count * 3 + Math.floor(Math.random() * 50));

  return (
    <div className="mb-4 space-y-2 py-3 border-y border-gray-100">
      <LiveViewerCount productId={listing.id} />
      <StockUrgency stock={listing.stock_quantity} />
      <BoughtCount count={boughtCount} />
    </div>
  );
}
