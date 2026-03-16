"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu, X, Package } from "lucide-react";
import { useCart, useWishlist } from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import { CartDrawer } from "@/components/cart/cart-drawer";

const NAV_CATEGORIES = [
  { name: "Electronics", slug: "electronics" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Fashion & Clothing", slug: "fashion-clothing" },
  { name: "Beauty & Health", slug: "beauty-health" },
  { name: "Sports & Fitness", slug: "sports-fitness" },
  { name: "Deals", slug: "/deals", isPage: true },
  { name: "Gift Cards", slug: "/gift-cards", isPage: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
        Free delivery on orders over R500 | Same-day dispatch before 12pm
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-header-bg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package size={18} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Shop<span className="text-primary">MO</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more..."
                  className="w-full pl-4 pr-12 py-2.5 border border-border rounded-full bg-muted focus:bg-white focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-primary-foreground rounded-full hover:bg-primary-hover transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/account/profile"
                className="hidden sm:flex items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <User size={22} />
                <span className="hidden lg:inline text-sm">Account</span>
              </Link>
              <Link
                href="/account/wishlist"
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Navigation */}
          <nav className="hidden lg:flex items-center gap-6 pb-2">
            <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Menu size={16} />
              All Products
            </Link>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.isPage ? cat.slug : `/categories/${cat.slug}`}
                className={cn(
                  "text-sm text-muted-foreground hover:text-primary transition-colors",
                  cat.slug === "/deals" && "text-secondary font-semibold hover:text-secondary-hover"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2 border border-border rounded-full bg-muted focus:bg-white focus:border-primary focus:outline-none text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <nav className="px-4 py-3 space-y-1">
              <Link href="/products" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
                All Products
              </Link>
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.isPage ? cat.slug : `/categories/${cat.slug}`}
                  className="block py-2 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link href="/account/profile" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                My Account
              </Link>
              <Link href="/account/orders" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                My Orders
              </Link>
              <Link href="/help" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                Help Centre
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
