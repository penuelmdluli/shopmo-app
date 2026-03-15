"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist, useCart } from "@/components/providers/providers";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Save items you love to your wishlist and come back to them later.
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          My Wishlist ({items.length} item{items.length !== 1 ? "s" : ""})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const listing = item.listing;
          if (!listing) return null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300" onError={(e) => { const t = e.currentTarget; if (listing.images!.length > 1 && t.src !== listing.images![1]) { t.src = listing.images![1]; } else { t.style.display = "none"; } }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingCart size={40} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link href={`/products/${listing.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                </Link>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(listing.current_price)}
                  </span>
                  {listing.original_price && listing.original_price > listing.current_price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(listing.original_price)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => addItem(listing)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(listing)}
                    className="p-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
