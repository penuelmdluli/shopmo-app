"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Minus, Plus, Check } from "lucide-react";
import { useCart, useWishlist } from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import { trackViewContent } from "@/lib/facebook-pixel";
import type { StorefrontListing } from "@/types/database";

interface ProductActionsProps {
  listing: StorefrontListing;
}

export function ProductActions({ listing }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(listing.id);

  // Facebook Pixel: track product view
  useEffect(() => {
    trackViewContent({
      content_name: listing.title,
      content_ids: [listing.id],
      content_type: "product",
      value: listing.current_price,
    });
  }, [listing.id, listing.title, listing.current_price]);

  const handleAddToCart = () => {
    addItem(listing, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {listing.is_in_stock ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-700 font-medium">In Stock</span>
            <span className="text-sm text-muted-foreground">({listing.stock_quantity} available)</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm text-red-700 font-medium">Out of Stock</span>
          </>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity:</span>
        <div className="flex items-center border border-border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(listing.stock_quantity, quantity + 1))}
            className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!listing.is_in_stock}
          className={cn(
            "flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors",
            added
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary-hover",
            !listing.is_in_stock && "opacity-50 cursor-not-allowed"
          )}
        >
          {added ? (
            <>
              <Check size={18} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
        <button
          onClick={() => toggleWishlist(listing)}
          className={cn(
            "p-3 border border-border rounded-lg hover:bg-gray-50 transition-colors",
            wishlisted ? "text-red-500 border-red-200 bg-red-50" : "text-gray-400"
          )}
        >
          <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
