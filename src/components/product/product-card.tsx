"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart, useWishlist } from "@/components/providers/providers";
import type { StorefrontListing } from "@/types/database";

interface ProductCardProps {
  listing: StorefrontListing;
  className?: string;
}

export function ProductCard({ listing, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(listing.id);

  const hasDiscount = listing.original_price && listing.original_price > listing.current_price;
  const discountPercent = hasDiscount
    ? Math.round(((listing.original_price! - listing.current_price) / listing.original_price!) * 100)
    : 0;

  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <div className={cn("group bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col", className)}>
      {/* Image */}
      <Link href={`/products/${listing.slug}`} className="relative block aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              // Try fallback image (second in array), then placeholder
              if (listing.images && listing.images.length > 1 && target.src !== listing.images[1]) {
                target.src = listing.images[1];
              } else {
                target.style.display = "none";
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(listing); }}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors",
            wishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
          )}
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/products/${listing.slug}`} className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mb-1">
          {listing.title}
        </Link>

        {/* Rating — only show when reviews exist */}
        {listing.rating_count > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={star <= Math.round(listing.rating_average) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({listing.rating_count})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground">New Arrival</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-foreground">{formatCurrency(listing.current_price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(listing.original_price!)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => addItem(listing)}
          className="mt-2 w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
