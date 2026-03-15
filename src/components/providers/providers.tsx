"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, createContext, useContext, useCallback, useEffect } from "react";
import type { CartItem, StorefrontListing, WishlistItem } from "@/types/database";
import { trackAddToCart, trackAddToWishlist } from "@/lib/facebook-pixel";

// ============================================
// Cart Context
// ============================================
interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (listing: StorefrontListing, quantity?: number) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

// ============================================
// Wishlist Context
// ============================================
interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (listingId: string) => boolean;
  toggleWishlist: (listing: StorefrontListing) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within Providers");
  return ctx;
}

// ============================================
// Providers Component
// ============================================
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Cart state (localStorage-backed for guests)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("shopmo_cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("shopmo_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist cart
  useEffect(() => {
    localStorage.setItem("shopmo_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("shopmo_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addItem = useCallback((listing: StorefrontListing, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.listing_id === listing.id);
      if (existing) {
        return prev.map(i =>
          i.listing_id === listing.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        cart_id: "local",
        listing_id: listing.id,
        quantity,
        unit_price: listing.current_price,
        added_at: new Date().toISOString(),
        listing,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
    // Facebook Pixel: track add to cart
    trackAddToCart({
      content_name: listing.title,
      content_ids: [listing.id],
      content_type: "product",
      value: listing.current_price * quantity,
    });
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setCartItems(prev => prev.filter(i => i.listing_id !== listingId));
  }, []);

  const updateQuantity = useCallback((listingId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.listing_id !== listingId));
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.listing_id === listingId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const isInWishlist = useCallback(
    (listingId: string) => wishlistItems.some(i => i.listing_id === listingId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback((listing: StorefrontListing) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i.listing_id === listing.id);
      if (exists) return prev.filter(i => i.listing_id !== listing.id);
      // Facebook Pixel: track add to wishlist (only when adding, not removing)
      trackAddToWishlist({
        content_name: listing.title,
        content_ids: [listing.id],
        value: listing.current_price,
      });
      return [...prev, {
        id: crypto.randomUUID(),
        customer_id: "local",
        listing_id: listing.id,
        created_at: new Date().toISOString(),
        listing,
      }];
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartContext.Provider
        value={{ items: cartItems, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen }}
      >
        <WishlistContext.Provider value={{ items: wishlistItems, isInWishlist, toggleWishlist }}>
          {children}
        </WishlistContext.Provider>
      </CartContext.Provider>
    </QueryClientProvider>
  );
}
