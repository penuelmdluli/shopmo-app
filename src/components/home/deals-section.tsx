"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { useCart } from "@/components/providers/providers";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/database";

interface DealsSectionProps {
  deals: Deal[];
}

export function DealsSection({ deals }: DealsSectionProps) {
  const { addItem } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {deals.map((deal) => {
        const listing = deal.listing;
        if (!listing) return null;
        const quantitySold = deal.quantity_sold ?? 0;
        const quantityAvail = deal.quantity_available ?? 0;
        const soldPercent = quantityAvail > 0
          ? Math.round((quantitySold / quantityAvail) * 100)
          : 0;
        const dealType = deal.deal_type || "flash_sale";
        const discountPct = deal.discount_percentage ?? (
          deal.original_price > 0
            ? Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100)
            : 0
        );

        return (
          <div key={deal.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full uppercase">
                {dealType.replace("_", " ")}
              </span>
              <CountdownTimer endsAt={deal.ends_at} />
            </div>

            <Link href={`/products/${listing.slug}`}>
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" onError={(e) => { const t = e.currentTarget; if (listing.images!.length > 1 && t.src !== listing.images![1]) { t.src = listing.images![1]; } else { t.style.display = "none"; } }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingCart size={40} />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-foreground">{formatCurrency(deal.deal_price)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(deal.original_price)}</span>
              {discountPct > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Stock bar */}
            {quantityAvail > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{quantitySold} sold</span>
                  <span>{quantityAvail - quantitySold} left</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all"
                    style={{ width: `${Math.min(soldPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => addItem(listing)}
              className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
          </div>
        );
      })}
    </div>
  );
}
