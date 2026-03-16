"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Truck,
  CreditCard,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  ShoppingCart,
  Building2,
  Zap,
  QrCode,
} from "lucide-react";
import { useCart } from "@/components/providers/providers";
import { formatCurrency, cn, SA_PROVINCES } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, VAT_RATE } from "@/lib/constants";
import { trackInitiateCheckout } from "@/lib/facebook-pixel";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Shipping", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: ClipboardCheck },
];

const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Delivery", price: 65, days: "3-5 business days", provider: "The Courier Guy" },
  { id: "express", name: "Express Delivery", price: 99, days: "1-2 business days", provider: "The Courier Guy" },
  { id: "same_day", name: "Same Day Delivery", price: 149, days: "Today (order before 12pm)", provider: "The Courier Guy" },
  { id: "pargo", name: "Pargo Pickup Point", price: 45, days: "3-5 business days", provider: "Pargo" },
];

const PAYMENT_OPTIONS = [
  { id: "yoco_card", name: "Credit/Debit Card", provider: "Yoco", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "yoco_eft", name: "EFT Payment", provider: "Yoco", icon: Building2, description: "Bank transfer via Yoco" },
  { id: "yoco_apple", name: "Apple Pay", provider: "Yoco", icon: Zap, description: "Pay with Apple Pay" },
  { id: "snapscan", name: "SnapScan", provider: "Yoco", icon: QrCode, description: "Scan to pay with SnapScan" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);

  // Facebook Pixel: track checkout initiation
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        content_ids: items.map(i => i.listing_id),
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
        value: subtotal,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Address state
  const [address, setAddress] = useState({
    full_name: "",
    email: "",
    phone: "",
    street_address: "",
    suburb: "",
    city: "",
    province: "",
    postal_code: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(true);

  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState("standard");

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState("yoco_card");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping)!;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD && shippingOption.id !== "same_day" ? 0 : shippingOption.price;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + shippingCost + vat;

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.full_name.trim()) newErrors.full_name = "Required";
    if (!address.email.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) newErrors.email = "Invalid email";
    if (!address.phone.trim()) newErrors.phone = "Required";
    if (!address.street_address.trim()) newErrors.street_address = "Required";
    if (!address.city.trim()) newErrors.city = "Required";
    if (!address.province) newErrors.province = "Required";
    if (!address.postal_code.trim()) newErrors.postal_code = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && useNewAddress) {
      if (!validateAddress()) return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    try {
      // Step 1: Create order in database via /api/checkout
      const shippingMethodMap: Record<string, string> = {
        standard: "the_courier_guy",
        express: "bob_go_express",
        same_day: "bob_go_express",
        pargo: "pargo_pickup",
      };

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            listing_id: item.listing_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            product_name: item.listing?.title || "Product",
            product_image: item.listing?.images?.[0] || "",
            sku: item.listing?.sku || "",
          })),
          address,
          shipping_method: shippingMethodMap[selectedShipping] || "the_courier_guy",
          payment_method: "card",
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok || !checkoutData.success) {
        setErrors({ submit: checkoutData.error || "Failed to create order. Please try again." });
        setIsPlacingOrder(false);
        return;
      }

      const orderNumber = checkoutData.order.order_number;
      const orderTotal = checkoutData.order.total;

      // Step 2: Redirect to Yoco payment
      const totalInCents = Math.round(orderTotal * 100);

      const payRes = await fetch("/api/payments/yoco/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalInCents,
          orderId: orderNumber,
          items: items.map(item => ({
            title: item.listing?.title || "Product",
            quantity: item.quantity,
            price: Math.round(item.unit_price * 100),
          })),
        }),
      });

      const payData = await payRes.json();

      if (payData.redirectUrl) {
        sessionStorage.setItem("shopmo_pending_order", JSON.stringify({
          orderId: orderNumber,
          total: orderTotal,
          items: items.map(i => ({ title: i.listing?.title, qty: i.quantity, price: i.unit_price })),
        }));
        window.location.href = payData.redirectUrl;
      } else {
        setErrors({ submit: "Payment setup failed. Your order has been saved — please try again from your account." });
      }
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 max-w-xl">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isComplete = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isComplete
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                      ? "border-primary text-primary bg-primary/10"
                      : "border-gray-300 text-gray-400"
                  )}
                >
                  {isComplete ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 font-medium",
                    isCurrent ? "text-primary" : isComplete ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mt-[-1rem]",
                    step > s.id ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Step Content */}
        <div className="flex-1">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Enter new address</span>
                </label>
              </div>

              {useNewAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={address.full_name}
                      onChange={(e) => handleAddressChange("full_name", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.full_name ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.phone ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => handleAddressChange("email", e.target.value)}
                      placeholder="For order confirmation & tracking updates"
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.email ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={address.street_address}
                      onChange={(e) => handleAddressChange("street_address", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.street_address ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.street_address && <p className="text-xs text-red-500 mt-1">{errors.street_address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                    <input
                      type="text"
                      value={address.suburb}
                      onChange={(e) => handleAddressChange("suburb", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.city ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                    <select
                      value={address.province}
                      onChange={(e) => handleAddressChange("province", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white",
                        errors.province ? "border-red-400" : "border-gray-300"
                      )}
                    >
                      <option value="">Select Province</option>
                      {SA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={address.postal_code}
                      onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                        errors.postal_code ? "border-red-400" : "border-gray-300"
                      )}
                    />
                    {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => {
                  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD && option.id !== "same_day";
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors",
                        selectedShipping === option.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={() => setSelectedShipping(option.id)}
                          className="w-4 h-4 text-primary"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{option.name}</p>
                          <p className="text-xs text-gray-500">
                            {option.days} &middot; {option.provider}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {isFree ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatCurrency(option.price)
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors",
                        selectedPayment === option.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={selectedPayment === option.id}
                        onChange={() => setSelectedPayment(option.id)}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{option.name}</p>
                        <p className="text-xs text-gray-500">
                          {option.description} &middot; via {option.provider}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.listing?.images && item.listing.images.length > 0 ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.listing.images[0]} alt={item.listing?.title || ""} className="w-full h-full object-contain p-1" onError={(e) => { const t = e.currentTarget; if (item.listing!.images!.length > 1 && t.src !== item.listing!.images![1]) { t.src = item.listing!.images![1]; } else { t.style.display = "none"; } }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCart size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.listing?.title || "Product"}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Delivery Address</h3>
                  <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">
                    Change
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {address.full_name}<br />
                  {address.email}<br />
                  {address.street_address}
                  {address.suburb && <>, {address.suburb}</>}<br />
                  {address.city}, {address.province}, {address.postal_code}
                </p>
              </div>

              {/* Shipping Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Shipping Method</h3>
                  <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">
                    Change
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {shippingOption.name} - {shippingOption.days}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
                  <button onClick={() => setStep(3)} className="text-xs text-primary hover:underline">
                    Change
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.name} via{" "}
                  {PAYMENT_OPTIONS.find((o) => o.id === selectedPayment)?.provider}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            ) : (
              <Link
                href="/cart"
                className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
                Back to Cart
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="px-8 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="hidden lg:block lg:w-80 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatCurrency(shippingCost)
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
          </div>
        </div>
      </div>
    </div>
  );
}
