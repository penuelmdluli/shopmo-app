import { createClient } from "./server";
import type { StorefrontListing, StorefrontCategory, CustomerReview, Deal, CustomerOrder, Coupon } from "@/types/database";
import { MOCK_LISTINGS, MOCK_CATEGORIES, MOCK_REVIEWS, MOCK_DEALS } from "@/lib/mock-data";

// ============================================
// Product Queries — fetches from SellBot's shared Supabase DB
// Falls back to mock data when Supabase is unavailable or empty
// ============================================

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

  return {
    id: product.id as string,
    product_id: product.id as string,
    title: name,
    description: (product.description as string) || "",
    category: (product.category as string) || "Uncategorized",
    slug,
    images,
    current_price: Number(product.estimated_sell_price || product.current_price || 0),
    original_price: Number(product.original_price || product.estimated_sell_price || 0),
    sku: (product.barcode_ean as string) || (product.sku as string) || `SM-${(product.id as string).slice(0, 8)}`,
    stock_quantity: Number(product.stock_quantity ?? product.total_units_sold ?? 10),
    is_in_stock: true,
    rating_average: Number(product.avg_rating || 0),
    rating_count: Number(product.review_count || 0),
    tags: Array.isArray(product.tags) ? product.tags as string[] : [],
    attributes: (product.attributes as Record<string, string>) || (product.ai_analysis as Record<string, string>) || {},
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
    original_price: Number(listing.max_price || listing.current_price || product?.estimated_sell_price || 0),
    sku: (listing.barcode_ean as string) || (product?.barcode_ean as string) || `SM-${(listing.id as string).slice(0, 8)}`,
    stock_quantity: Number(listing.stock_quantity ?? 10),
    is_in_stock: Number(listing.stock_quantity ?? 10) > 0,
    rating_average: Number(listing.avg_rating || product?.avg_rating || 0),
    rating_count: Number(listing.review_count || product?.review_count || 0),
    tags: Array.isArray(product?.tags) ? product.tags as string[] : [],
    attributes: (listing.attributes as Record<string, string>) || {},
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
 * Get all storefront listings. Tries Supabase first, falls back to mock data.
 * Fetches from SellBot's `products` table where status is 'approved' or 'live',
 * plus any `listings` that are active.
 */
export async function getListings(): Promise<StorefrontListing[]> {
  try {
    const supabase = await createClient();

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

    // If Supabase returned nothing, use mock data
    console.log("[ShopMO] No products in Supabase, using mock data");
    return MOCK_LISTINGS;
  } catch (error) {
    console.error("[ShopMO] Supabase query error, falling back to mock data:", error);
    return MOCK_LISTINGS;
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

  // Also check mock data directly (slug might match mock but not real)
  const mockFound = MOCK_LISTINGS.find((l) => l.slug === slug);
  return mockFound || null;
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
    const supabase = await createClient();
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

    // If we got real categories from products, create category objects
    if (categorySet.size > 0 && listings !== MOCK_LISTINGS) {
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

    return MOCK_CATEGORIES;
  } catch {
    return MOCK_CATEGORIES;
  }
}

/**
 * Get reviews for a listing. Falls back to mock reviews.
 */
export async function getReviews(listingId: string): Promise<CustomerReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*, customer:customers(full_name, avatar_url)")
      .eq("listing_id", listingId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as CustomerReview[];
    }

    // Fall back to mock reviews for this listing
    return MOCK_REVIEWS.filter((r) => r.listing_id === listingId);
  } catch {
    return MOCK_REVIEWS.filter((r) => r.listing_id === listingId);
  }
}

/**
 * Get active deals. Falls back to mock deals.
 */
export async function getDeals(): Promise<Deal[]> {
  try {
    const supabase = await createClient();
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

    return MOCK_DEALS;
  } catch {
    return MOCK_DEALS;
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
    "Fashion": "Shirt",
    "Beauty & Health": "Heart",
    "Sports & Outdoors": "Dumbbell",
    "Toys & Games": "Gamepad2",
    "Automotive": "Car",
    "Garden & DIY": "Flower2",
  };
  return iconMap[name] || "Package";
}
