"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, Tag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/providers";
import { formatCurrency } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, VAT_RATE } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const discount = couponApplied ? couponDiscount : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : 65;
  const vat = afterDiscount * VAT_RATE;
  const total = afterDiscount + shipping + vat;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    setIsValidating(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}&subtotal=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponDiscount(data.discount || 0);
      } else {
        setCouponError(data.reason || "Invalid coupon code");
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch {
      setCouponError("Could not validate coupon. Try again.");
      setCouponApplied(false);
    } finally {
      setIsValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart ({items.length} item{items.length !== 1 ? "s" : ""})
      </h1>

      <div className="lg:flex lg:gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const listing = item.listing;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
              >
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {listing?.images && listing.images.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={listing.images[0]} alt={listing?.title || ""} className="w-full h-full object-contain p-1" onError={(e) => { const t = e.currentTarget; if (listing.images!.length > 1 && t.src !== listing.images![1]) { t.src = listing.images![1]; } else { t.style.display = "none"; } }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart size={28} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link href={listing ? `/products/${listing.slug}` : "#"}>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                        {listing?.title || "Product"}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeItem(item.listing_id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(item.unit_price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.listing_id, item.quantity - 1)}
                        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.listing_id, item.quantity + 1)}
                        className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Line Total */}
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline mt-2"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {couponApplied && discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">VAT (15%)</span>
                <span className="font-medium">{formatCurrency(vat)}</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery!
              </p>
            )}

            {/* Coupon */}
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    placeholder="Coupon code"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={isValidating}
                  className="px-3 py-2 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {isValidating ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-xs text-green-600 mt-1">Coupon SHOPMO10 applied!</p>
              )}
            </div>

            <Link
              href="/checkout"
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
