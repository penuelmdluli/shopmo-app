import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Product Hunter API
 * Fetches trending products from Takealot's public search API,
 * extracts real images, prices, and product data, then inserts
 * them into the shared Supabase `products` table.
 *
 * POST /api/hunter — run the hunter with curated search terms
 * POST /api/hunter?terms=bluetooth+earbuds&category=Electronics — custom search
 */

const TAKEALOT_SEARCH_URL =
  "https://api.takealot.com/rest/v-1-12-0/searches/products";

// Curated search terms per ShopMO category
const HUNT_CATEGORIES: Record<string, string[]> = {
  Electronics: [
    "bluetooth earbuds",
    "power bank 10000mah",
    "usb c fast charger",
    "smart watch",
    "LED desk lamp",
    "ring light tripod",
    "wireless mouse",
    "usb hub",
  ],
  "Home & Kitchen": [
    "air fryer",
    "blender",
    "cookware set",
    "kitchen scale digital",
    "food storage containers",
    "handheld vacuum",
  ],
  Fashion: [
    "sneakers men",
    "sunglasses polarized",
    "backpack laptop",
    "wallet mens leather",
    "cap",
    "crossbody bag",
  ],
  "Beauty & Health": [
    "hair dryer",
    "electric toothbrush",
    "face moisturizer",
    "nail kit",
    "massage gun",
  ],
  "Sports & Outdoors": [
    "yoga mat",
    "dumbbells set",
    "camping lantern",
    "water bottle stainless steel",
    "fitness tracker",
  ],
  "Toys & Games": [
    "board game",
    "lego",
    "remote control car",
    "puzzle 1000 piece",
    "kids tablet",
  ],
  Automotive: [
    "car phone mount",
    "dash cam",
    "car vacuum cleaner",
    "led headlight bulb",
    "car seat cover",
  ],
  "Garden & DIY": [
    "garden hose",
    "drill cordless",
    "solar garden lights",
    "tool set",
    "pressure washer",
  ],
};

interface TakealotProduct {
  title: string;
  brand: string;
  images: string[];
  price: number;
  original_price: number;
  tsin: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
  slug: string;
}

/**
 * Search Takealot public API for a term and return the first matching product.
 */
async function searchTakealot(
  term: string
): Promise<TakealotProduct | null> {
  try {
    const url = `${TAKEALOT_SEARCH_URL}?newsearch=true&qsearch=${encodeURIComponent(term)}&resultcount=5`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(`[Hunter] Takealot search failed for "${term}":`, res.status);
      return null;
    }

    const data = await res.json();
    const results = data?.sections?.products?.results;

    if (!results || results.length === 0) return null;

    // Pick the first product result
    const item = results[0];
    const core = item?.product_views?.core;
    const gallery = item?.product_views?.gallery;
    const buybox = item?.product_views?.buybox_summary;
    const stock = item?.product_views?.stock_availability_summary;
    const ratings = item?.product_views?.ratings;

    if (!core || !buybox) return null;

    // Extract images — replace {size} placeholder with pdpxl for high quality
    const rawImages: string[] = gallery?.images || [];
    const images = rawImages
      .map((img: string) => img.replace("{size}", "pdpxl"))
      .slice(0, 5); // Max 5 images per product

    const price = buybox?.prices?.[0] || 0;
    const listingPrice = buybox?.listing_price || price;

    return {
      title: core.title || term,
      brand: core.brand || "",
      images,
      price,
      original_price: listingPrice > price ? listingPrice : Math.round(price * 1.3),
      tsin: String(buybox?.tsin || core?.id || ""),
      rating: ratings?.star_rating || 0,
      review_count: ratings?.count || 0,
      in_stock: stock?.status === "in_stock" || stock?.status === "available",
      slug: core.slug || "",
    };
  } catch (err) {
    console.error(`[Hunter] Error searching "${term}":`, err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Protect hunter with API key
    const authHeader = request.headers.get("authorization");
    const hunterKey = process.env.HUNTER_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authHeader || authHeader !== `Bearer ${hunterKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServiceClient();

    // Check for custom search params
    const { searchParams } = new URL(request.url);
    const customTerms = searchParams.get("terms");
    const customCategory = searchParams.get("category");

    let categoriesToHunt: Record<string, string[]>;

    if (customTerms && customCategory) {
      categoriesToHunt = {
        [customCategory]: customTerms.split(",").map((t) => t.trim()),
      };
    } else {
      // Use default curated list, or accept body override
      try {
        const body = await request.json();
        categoriesToHunt = body.categories || HUNT_CATEGORIES;
      } catch {
        categoriesToHunt = HUNT_CATEGORIES;
      }
    }

    // Get the SellBot user_id (first user in the system)
    const { data: users } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    const userId = users?.[0]?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "No SellBot user found. Create a user first." },
        { status: 400 }
      );
    }

    const results: {
      category: string;
      term: string;
      product: TakealotProduct | null;
      inserted: boolean;
      error?: string;
    }[] = [];

    let totalInserted = 0;
    const seenTsins = new Set<string>();

    // Get existing TSINs to avoid duplicates
    const { data: existingProducts } = await supabase
      .from("products")
      .select("takealot_tsin")
      .not("takealot_tsin", "is", null);

    if (existingProducts) {
      existingProducts.forEach((p: { takealot_tsin: string | null }) => {
        if (p.takealot_tsin) seenTsins.add(p.takealot_tsin);
      });
    }

    for (const [category, terms] of Object.entries(categoriesToHunt)) {
      for (const term of terms) {
        // Rate limit: 200ms between requests
        await new Promise((r) => setTimeout(r, 200));

        const product = await searchTakealot(term);

        if (!product || product.images.length === 0) {
          results.push({ category, term, product: null, inserted: false, error: "No results or no images" });
          continue;
        }

        // Skip duplicates
        if (seenTsins.has(product.tsin)) {
          results.push({ category, term, product, inserted: false, error: "Duplicate TSIN" });
          continue;
        }
        seenTsins.add(product.tsin);

        // Generate slug
        const slug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);

        // Insert into products table
        const { error: insertError } = await supabase.from("products").insert({
          user_id: userId,
          name: product.title,
          category,
          description: `${product.title}. ${product.brand ? `Brand: ${product.brand}.` : ""} Available on ShopMO with fast delivery across South Africa.`,
          images: product.images,
          estimated_sell_price: product.price,
          estimated_cost: Math.round(product.price * 0.6),
          estimated_margin: 40,
          status: "approved",
          source_platform: "takealot",
          source_url: `https://www.takealot.com/${product.slug}`,
          takealot_tsin: product.tsin,
          takealot_tsin_exists: true,
          opportunity_score: 75,
          demand_score: 80,
          competition_score: 50,
          margin_score: 70,
          avg_rating: product.rating,
          review_count: product.review_count,
          tags: [category.toLowerCase().replace(/ & /g, "-"), ...term.split(" ")],
          slug,
        });

        if (insertError) {
          // slug column might not exist, try without it
          const { error: retryError } = await supabase.from("products").insert({
            user_id: userId,
            name: product.title,
            category,
            description: `${product.title}. ${product.brand ? `Brand: ${product.brand}.` : ""} Available on ShopMO with fast delivery across South Africa.`,
            images: product.images,
            estimated_sell_price: product.price,
            estimated_cost: Math.round(product.price * 0.6),
            estimated_margin: 40,
            status: "approved",
            source_platform: "takealot",
            source_url: `https://www.takealot.com/${product.slug}`,
            takealot_tsin: product.tsin,
            takealot_tsin_exists: true,
            opportunity_score: 75,
            demand_score: 80,
            competition_score: 50,
            margin_score: 70,
            avg_rating: product.rating,
            review_count: product.review_count,
            tags: [category.toLowerCase().replace(/ & /g, "-"), ...term.split(" ")],
          });

          if (retryError) {
            results.push({
              category,
              term,
              product,
              inserted: false,
              error: retryError.message,
            });
            continue;
          }
        }

        totalInserted++;
        results.push({ category, term, product, inserted: true });
      }
    }

    // Summary per category
    const summary: Record<string, { hunted: number; inserted: number; failed: number }> = {};
    for (const r of results) {
      if (!summary[r.category]) {
        summary[r.category] = { hunted: 0, inserted: 0, failed: 0 };
      }
      summary[r.category].hunted++;
      if (r.inserted) summary[r.category].inserted++;
      else summary[r.category].failed++;
    }

    return NextResponse.json({
      success: true,
      total_hunted: results.length,
      total_inserted: totalInserted,
      total_failed: results.length - totalInserted,
      summary,
      results: results.map((r) => ({
        category: r.category,
        term: r.term,
        title: r.product?.title || null,
        images: r.product?.images?.length || 0,
        price: r.product?.price || null,
        inserted: r.inserted,
        error: r.error || null,
      })),
    });
  } catch (err) {
    console.error("[Hunter] Fatal error:", err);
    return NextResponse.json(
      { error: "Hunter failed", details: String(err) },
      { status: 500 }
    );
  }
}
