export const SITE_NAME = "ShopMO";
export const SITE_DESCRIPTION = "South Africa's smartest online store. Trending products, fast delivery, AI-powered shopping.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shopmoo.co.za";

export const CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: "Smartphone", image: "/images/categories/electronics.svg" },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: "Home", image: "/images/categories/home.svg" },
  { name: "Fashion & Clothing", slug: "fashion-clothing", icon: "Shirt", image: "/images/categories/fashion.svg" },
  { name: "Beauty & Health", slug: "beauty-health", icon: "Heart", image: "/images/categories/beauty.svg" },
  { name: "Sports & Fitness", slug: "sports-fitness", icon: "Dumbbell", image: "/images/categories/sports.svg" },
  { name: "Toys & Games", slug: "toys-games", icon: "Gamepad2", image: "/images/categories/toys.svg" },
  { name: "Automotive", slug: "automotive", icon: "Car", image: "/images/categories/auto.svg" },
  { name: "Garden & Outdoor", slug: "garden-outdoor", icon: "Flower2", image: "/images/categories/garden.svg" },
  { name: "Baby & Kids", slug: "baby-kids", icon: "Baby", image: "/images/categories/toys.svg" },
  { name: "Pet Supplies", slug: "pet-supplies", icon: "Heart", image: "/images/categories/home.svg" },
  { name: "Tools & Hardware", slug: "tools-hardware", icon: "Wrench", image: "/images/categories/garden.svg" },
  { name: "Office & Stationery", slug: "office-stationery", icon: "BookOpen", image: "/images/categories/electronics.svg" },
] as const;

export const VALUE_PROPOSITIONS = [
  { icon: "Truck", title: "Free Delivery", subtitle: "On orders over R500" },
  { icon: "Zap", title: "Same-Day Dispatch", subtitle: "Order before 12pm" },
  { icon: "RotateCcw", title: "30-Day Returns", subtitle: "Hassle-free returns" },
  { icon: "Shield", title: "Secure Checkout", subtitle: "SSL encrypted payments" },
] as const;

export const SHIPPING_PROVIDERS = [
  { id: "courier_guy", name: "The Courier Guy", type: "direct" },
] as const;

export const PAYMENT_METHODS = [
  { id: "yoco_card", name: "Credit/Debit Card", provider: "yoco", icon: "CreditCard" },
  { id: "yoco_eft", name: "EFT Payment", provider: "yoco", icon: "Building2" },
  { id: "yoco_apple", name: "Apple Pay", provider: "yoco", icon: "Zap" },
  { id: "yoco_snapscan", name: "SnapScan", provider: "yoco", icon: "QrCode" },
] as const;

export const ORDER_STATUSES = {
  pending_payment: { label: "Awaiting Payment", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", color: "bg-indigo-100 text-indigo-800" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-cyan-100 text-cyan-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
} as const;

export const FREE_SHIPPING_THRESHOLD = 500;
export const VAT_RATE = 0.15;
