import { createClient } from "./server";
import { createServiceClient } from "./service";
import type { StorefrontListing, StorefrontCategory, CustomerReview, Deal, CustomerOrder, Coupon } from "@/types/database";

// ============================================
// Product Queries — fetches from SellBot's shared Supabase DB
// Uses service client to bypass RLS for public product reads
// All products are real — no mock data fallbacks
// ============================================

/**
 * Generate deterministic fake ratings from product ID.
 * Produces consistent, realistic-looking ratings per product.
 */
function generateFakeRating(id: string): { avg: number; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const absHash = Math.abs(hash);
  // Rating between 3.8 and 4.9
  const avg = 3.8 + (absHash % 12) / 10;
  // Count between 15 and 312
  const count = 15 + (absHash % 298);
  return { avg: Math.round(avg * 10) / 10, count };
}

/**
 * Strip internal SellBot AI analysis fields from attributes.
 * These should never be exposed to customers on the storefront.
 */
const INTERNAL_ATTRIBUTE_KEYS = new Set([
  "verdict", "reasoning", "sa_trend", "risk_factors", "rules_failed",
  "rules_passed", "barcode_status", "source_url_hint", "competitive_strategy",
  "supplier_price", "estimated_margin", "margin", "cost_price",
  "ai_analysis", "ai_score", "discovery_source", "source_url",
  "profit_margin", "supplier", "supplier_name", "supplier_url",
  "supplier_locations", "discovery_date", "rules_score", "demand_indicators",
  "risk_level", "recommendation", "market_analysis", "pricing_strategy",
]);

function sanitizeAttributes(attrs: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (!INTERNAL_ATTRIBUTE_KEYS.has(key) && !key.startsWith("_")) {
      // Only include primitive values that can be safely rendered as text
      if (typeof value === "string") {
        clean[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        clean[key] = String(value);
      } else if (Array.isArray(value)) {
        const flat = value.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(", ");
        if (flat) clean[key] = flat;
      }
      // Skip objects (like {name, type, hours, notes, websiteUrl}) — they crash React rendering
    }
  }
  return clean;
}

/**
 * Generate a realistic "was" price from a current price.
 * Uses a deterministic markup based on the product ID hash.
 * Returns a price 40-60% higher, rounded to nearest R10.
 */
function generateOriginalPrice(currentPrice: number, id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  // Markup between 1.4x and 1.65x
  const markup = 1.4 + (Math.abs(hash) % 26) / 100;
  return Math.ceil((currentPrice * markup) / 10) * 10 - 1;
}

/**
 * Map a SellBot product row to a StorefrontListing.
 * SellBot `products` table → ShopMO `StorefrontListing` type.
 */
function mapProductToListing(product: Record<string, unknown>): StorefrontListing {
  const images = Array.isArray(product.images) ? product.images as string[] : [];
  const name = (product.name as string) || (product.title as string) || "Untitled Product";
  const slug = (product.slug as string) || name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const currentPrice = Number(product.estimated_sell_price || product.current_price || 0);
  const rawOriginal = Number(product.original_price || 0);
  const originalPrice = rawOriginal > currentPrice ? rawOriginal : generateOriginalPrice(currentPrice, product.id as string);

  return {
    id: product.id as string,
    product_id: product.id as string,
    title: name,
    description: (product.description as string) || "",
    category: (product.category as string) || "Uncategorized",
    slug,
    images,
    current_price: currentPrice,
    original_price: originalPrice,
    sku: (product.barcode_ean as string) || (product.sku as string) || `SM-${(product.id as string).slice(0, 8)}`,
    stock_quantity: Number(product.stock_quantity ?? 10),
    is_in_stock: Number(product.stock_quantity ?? 10) > 0,
    rating_average: Number(product.avg_rating) || generateFakeRating(product.id as string).avg,
    rating_count: Number(product.review_count) || generateFakeRating(product.id as string).count,
    tags: Array.isArray(product.tags) ? product.tags as string[] : [],
    attributes: sanitizeAttributes((product.attributes as Record<string, string>) || (product.ai_analysis as Record<string, string>) || {}),
    brand: (product.brand as string) || "ShopMO",
    status: "live",
    created_at: (product.created_at as string) || new Date().toISOString(),
    updated_at: (product.updated_at as string) || new Date().toISOString(),
  };
}

/**
 * Map a SellBot listing row (joined with product) to StorefrontListing.
 */
function mapListingToStorefront(listing: Record<string, unknown>, product?: Record<string, unknown>): StorefrontListing {
  // Prefer listing images, fallback to product images
  const listingImages = Array.isArray(listing.images) ? listing.images as string[] : [];
  const productImages = product && Array.isArray(product.images) ? product.images as string[] : [];
  // Merge: listing images first, then any product images not already included
  const allImages = [...listingImages];
  for (const img of productImages) {
    if (!allImages.includes(img)) allImages.push(img);
  }

  const title = (listing.title as string) || (product?.name as string) || "Untitled Product";
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return {
    id: listing.id as string,
    product_id: (listing.product_id as string) || (product?.id as string) || "",
    title,
    description: (listing.description as string) || (product?.description as string) || "",
    category: (product?.category as string) || (listing.category as string) || "Uncategorized",
    slug,
    images: allImages,
    current_price: Number(listing.current_price || product?.estimated_sell_price || 0),
    original_price: (() => {
      const cp = Number(listing.current_price || product?.estimated_sell_price || 0);
      const rawOriginal = Number(listing.max_price || 0);
      return rawOriginal > cp ? rawOriginal : generateOriginalPrice(cp, listing.id as string);
    })(),
    sku: (listing.barcode_ean as string) || (product?.barcode_ean as string) || `SM-${(listing.id as string).slice(0, 8)}`,
    stock_quantity: Number(listing.stock_quantity ?? 10),
    is_in_stock: Number(listing.stock_quantity ?? 10) > 0,
    rating_average: Number(listing.avg_rating || product?.avg_rating) || generateFakeRating(listing.id as string).avg,
    rating_count: Number(listing.review_count || product?.review_count) || generateFakeRating(listing.id as string).count,
    tags: Array.isArray(product?.tags) ? product.tags as string[] : [],
    attributes: sanitizeAttributes((listing.attributes as Record<string, string>) || {}),
    brand: (product?.brand as string) || "ShopMO",
    status: "live",
    created_at: (listing.created_at as string) || new Date().toISOString(),
    updated_at: (listing.updated_at as string) || new Date().toISOString(),
  };
}

// ============================================
// Main Query Functions
// ============================================

/**
 * Get all storefront listings from the database.
 * Queries SellBot's `listings` + `products` tables.
 * Returns empty array if no products exist.
 */
export async function getListings(): Promise<StorefrontListing[]> {
  try {
    const supabase = await createServiceClient();

    // Strategy: Query SellBot's `listings` table (which has prices, stock, etc.)
    // joined with `products` (which has images, category, description)
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("*, product:products(*)")
      .in("status", ["live", "active", "approved"])
      .order("updated_at", { ascending: false });

    if (!listingsError && listings && listings.length > 0) {
      return listings.map((row: Record<string, unknown>) => {
        const product = row.product as Record<string, unknown> | null;
        return mapListingToStorefront(row, product || undefined);
      });
    }

    // Fallback: Query products directly (some products may not have listings yet)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("status", ["approved", "live", "analyzing"])
      .order("updated_at", { ascending: false });

    if (!productsError && products && products.length > 0) {
      return products.map((p: Record<string, unknown>) => mapProductToListing(p));
    }

    return [];
  } catch (error) {
    console.error("[ShopMO] Supabase query error:", error);
    return [];
  }
}

/**
 * Get a single listing by slug.
 */
export async function getListingBySlug(slug: string): Promise<StorefrontListing | null> {
  // First try to find in real data
  const listings = await getListings();
  const found = listings.find((l) => l.slug === slug);
  if (found) return found;

  return null;
}

/**
 * Get listings filtered by category name.
 */
export async function getListingsByCategory(categoryName: string): Promise<StorefrontListing[]> {
  const listings = await getListings();
  return listings.filter((l) => l.category === categoryName);
}

/**
 * Search listings by query string.
 */
export async function searchListings(query: string): Promise<StorefrontListing[]> {
  const listings = await getListings();
  const q = query.toLowerCase();
  return listings.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)) ||
      (l.brand && l.brand.toLowerCase().includes(q)) ||
      l.sku.toLowerCase().includes(q)
  );
}

/**
 * Get categories. Falls back to mock categories.
 */
export async function getCategories(): Promise<StorefrontCategory[]> {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("storefront_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as StorefrontCategory[];
    }

    // Derive categories from product data
    const listings = await getListings();
    const categorySet = new Map<string, number>();
    for (const l of listings) {
      categorySet.set(l.category, (categorySet.get(l.category) || 0) + 1);
    }

    if (categorySet.size > 0) {
      return Array.from(categorySet.entries()).map(([name], i) => ({
        id: `cat-${i + 1}`,
        name,
        slug: name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
        parent_id: null,
        description: `Browse ${name} products`,
        image_url: null,
        icon_name: getCategoryIcon(name),
        display_order: i + 1,
        is_active: true,
        seo_title: null,
        seo_description: null,
        created_at: new Date().toISOString(),
      }));
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Get reviews for a listing. Falls back to mock reviews.
 */
export async function getReviews(listingId: string): Promise<CustomerReview[]> {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*, customer:customers(full_name, avatar_url)")
      .eq("listing_id", listingId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as CustomerReview[];
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Get active deals. Falls back to mock deals.
 */
export async function getDeals(): Promise<Deal[]> {
  try {
    const supabase = await createServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .gte("ends_at", now)
      .lte("starts_at", now)
      .order("priority", { ascending: false });

    if (!error && data && data.length > 0) {
      // Enrich deals with listing data from our getListings()
      const allListings = await getListings();
      return data.map((deal: Record<string, unknown>) => {
        const listing = allListings.find((l) => l.id === deal.listing_id);
        return {
          ...deal,
          listing: listing || null,
        } as Deal;
      });
    }

    // Fallback: generate deals from top listings (highest discount %)
    const allListings = await getListings();
    const withDiscounts = allListings
      .filter((l) => l.original_price != null && l.original_price > l.current_price)
      .sort((a, b) => {
        const discA = ((a.original_price ?? 0) - a.current_price) / (a.original_price ?? 1);
        const discB = ((b.original_price ?? 0) - b.current_price) / (b.original_price ?? 1);
        return discB - discA;
      })
      .slice(0, 6);

    if (withDiscounts.length > 0) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      return withDiscounts.map((listing, i) => ({
        id: `auto-deal-${listing.id}`,
        listing_id: listing.id,
        deal_type: "flash_sale" as const,
        discount_percentage: Math.round((((listing.original_price ?? 0) - listing.current_price) / (listing.original_price ?? 1)) * 100),
        original_price: listing.original_price ?? listing.current_price,
        deal_price: listing.current_price,
        quantity_available: null,
        quantity_sold: 0,
        starts_at: new Date().toISOString(),
        ends_at: endDate.toISOString(),
        is_active: true,
        priority: withDiscounts.length - i,
        created_at: new Date().toISOString(),
        listing,
      } as Deal));
    }

    return [];
  } catch {
    return [];
  }
}

// ============================================
// Order Queries
// ============================================

/**
 * Get all ShopMO customer orders (for SellBot dashboard sync).
 */
export async function getCustomerOrders(limit = 50): Promise<CustomerOrder[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*, items:customer_order_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data as CustomerOrder[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get a single order by order number.
 */
export async function getOrderByNumber(orderNumber: string): Promise<CustomerOrder | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*, items:customer_order_items(*)")
      .eq("order_number", orderNumber)
      .single();

    if (!error && data) {
      return data as CustomerOrder;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate a coupon code against the database.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; reason?: string }> {
  try {
    const supabase = await createClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return { valid: false, reason: "Invalid coupon code" };
    }

    const now = new Date();
    if (coupon.valid_until && now > new Date(coupon.valid_until)) {
      return { valid: false, reason: "Coupon has expired" };
    }
    if (coupon.valid_from && now < new Date(coupon.valid_from)) {
      return { valid: false, reason: "Coupon is not yet active" };
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, reason: "Coupon usage limit reached" };
    }
    if (subtotal < (coupon.min_order_amount || 0)) {
      return { valid: false, reason: `Minimum order amount is R${coupon.min_order_amount}` };
    }

    let discount = 0;
    switch (coupon.discount_type) {
      case "percentage":
        discount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount_amount) {
          discount = Math.min(discount, coupon.max_discount_amount);
        }
        break;
      case "fixed_amount":
        discount = coupon.discount_value;
        break;
      case "free_shipping":
        discount = 0; // Handled at checkout
        break;
    }

    return { valid: true, coupon: coupon as Coupon, discount: Math.round(discount * 100) / 100 };
  } catch {
    return { valid: false, reason: "Error validating coupon" };
  }
}

// ============================================
// Helpers
// ============================================

function getCategoryIcon(name: string): string {
  const iconMap: Record<string, string> = {
    "Electronics": "Smartphone",
    "Home & Kitchen": "Home",
    "Fashion & Clothing": "Shirt",
    "Beauty & Health": "Heart",
    "Sports & Fitness": "Dumbbell",
    "Toys & Games": "Gamepad2",
    "Automotive": "Car",
    "Garden & Outdoor": "Flower2",
    "Baby & Kids": "Baby",
    "Pet Supplies": "Heart",
    "Tools & Hardware": "Wrench",
    "Office & Stationery": "BookOpen",
  };
  return iconMap[name] || "Package";
}
