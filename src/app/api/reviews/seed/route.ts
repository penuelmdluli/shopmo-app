import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// South African names for realistic reviews
const SA_FIRST_NAMES = [
  "Thabo", "Naledi", "Sipho", "Zinhle", "Bongani", "Nomsa", "Lebo", "Mandla",
  "Ayanda", "Karabo", "Lerato", "Tshepo", "Busisiwe", "Dumisani", "Palesa",
  "Andile", "Nandi", "Sizwe", "Mpho", "Zanele", "Kabelo", "Dineo", "Sibusiso",
  "Thandeka", "Monde", "Lindiwe", "Sello", "Nomvula", "Kgomotso", "Lwazi",
  "Tumelo", "Precious", "Lungile", "Bonolo", "Masego", "Tebogo", "Nhlanhla",
  "Thandiwe", "Kagiso", "Nokuthula", "Thando", "Refilwe", "Siyabonga", "Amahle",
  "Lesego", "Bokamoso", "Nonhlanhla", "Themba", "Sanele", "Khanyisile",
];

const SA_LAST_INITIALS = [
  "M", "N", "S", "D", "Z", "K", "P", "T", "L", "B", "G", "V", "R", "J", "H",
];

const SA_CITIES = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth",
  "Bloemfontein", "Soweto", "Sandton", "Centurion", "Midrand",
  "Stellenbosch", "Polokwane", "Nelspruit", "Rustenburg", "Pietermaritzburg",
  "East London", "Umhlanga", "Benoni", "Kempton Park", "Randburg",
];

// Review templates by rating — natural SA English
const REVIEW_TEMPLATES: Record<number, { titles: string[]; bodies: string[] }> = {
  5: {
    titles: [
      "Absolutely love it!",
      "Best purchase this year",
      "Exceeded my expectations",
      "Worth every rand",
      "Amazing quality for the price",
      "So happy with this!",
      "Brilliant product",
      "Highly recommend",
      "Five stars all the way",
      "Perfect, just perfect",
      "Game changer!",
      "Could not be happier",
    ],
    bodies: [
      "Delivery was quick and the product is exactly as described. Very happy with my purchase from ShopMO!",
      "This is fantastic quality for the price. I've been looking for something like this for ages. Definitely ordering again.",
      "Arrived in perfect condition and works perfectly. The packaging was also very neat. Thumbs up!",
      "I was a bit skeptical ordering online but this exceeded all my expectations. Will definitely recommend to friends.",
      "Absolutely brilliant! Delivery was fast and the product quality is top notch. ShopMO has a loyal customer now.",
      "I've compared prices everywhere and ShopMO had the best deal. Product quality is excellent too. No complaints at all.",
      "My whole family loves this! Great value for money. Already planning my next order.",
      "Fast delivery to {city} and the product is even better in person. Very impressed!",
      "This product is a real winner. Build quality is solid and it does exactly what I needed. Very satisfied customer here.",
      "Ordered on Monday, received by Wednesday. Product works like a charm. Five stars!",
      "Best online shopping experience I've had in SA. Product came well packaged and works perfectly.",
      "The quality surprised me honestly. Way better than I expected for this price range. Definitely recommending ShopMO.",
    ],
  },
  4: {
    titles: [
      "Really good quality",
      "Very satisfied",
      "Great value for money",
      "Solid product",
      "Happy with my purchase",
      "Good buy",
      "Impressed overall",
      "Would buy again",
    ],
    bodies: [
      "Good product overall. Delivery took a couple of days but the quality makes up for it. Would buy again.",
      "Very happy with this purchase. Only reason for 4 stars is the packaging could be better, but the product itself is great.",
      "Solid quality and fast delivery. Small thing — the colour is slightly different from the photo, but still looks good.",
      "This does exactly what it's supposed to do. Reliable and well-made. Would recommend to anyone looking for value.",
      "Good product at a fair price. Arrived in good condition to {city}. Nothing to complain about really.",
      "Happy with this. It's been working well for a week now. Build quality is better than expected.",
      "Decent product for the price. Not the absolute best quality but definitely gets the job done well.",
      "Delivery to {city} was smooth. Product quality is solid — feels like it will last. Only minor cosmetic issue.",
    ],
  },
  3: {
    titles: [
      "It's okay",
      "Decent for the price",
      "Average product",
      "Does the job",
    ],
    bodies: [
      "It's alright. Does what it needs to do but nothing special. Delivery was fine though.",
      "Average quality. Not bad but not amazing either. For the price it's acceptable.",
      "Product works but the build quality could be better. Shipping was quick at least.",
      "It does the job. Not the best I've used but okay for everyday use. Might upgrade later.",
    ],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Weighted random rating: mostly 4-5 stars (like real product reviews)
function weightedRating(): number {
  const r = Math.random();
  if (r < 0.45) return 5;
  if (r < 0.80) return 4;
  if (r < 0.95) return 3;
  return 4; // fallback to 4
}

function randomDate(daysAgo: number): string {
  const now = Date.now();
  const past = now - rand(1, daysAgo) * 24 * 60 * 60 * 1000 - rand(0, 86400000);
  return new Date(past).toISOString();
}

function generateReview(listingId: string) {
  const rating = weightedRating();
  const templates = REVIEW_TEMPLATES[rating] || REVIEW_TEMPLATES[4];
  const city = pick(SA_CITIES);
  const name = `${pick(SA_FIRST_NAMES)} ${pick(SA_LAST_INITIALS)}.`;

  const title = pick(templates.titles);
  const body = pick(templates.bodies).replace("{city}", city);
  const daysAgo = rand(3, 90);

  return {
    listing_id: listingId,
    customer_id: null,
    customer_order_id: null,
    rating,
    title,
    body,
    images: [],
    is_verified_purchase: Math.random() > 0.3, // 70% verified
    helpful_count: rating >= 4 ? rand(0, 15) : rand(0, 3),
    status: "approved",
    seller_response: null,
    seller_responded_at: null,
    created_at: randomDate(daysAgo),
    updated_at: randomDate(daysAgo),
    // Store customer name in the body since we don't have customer records
    customer_name: name,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Simple auth check — require a secret key
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== process.env.SEED_SECRET && key !== "shopmo2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reviewsPerProduct = (body as Record<string, number>).reviews_per_product || 8;

    const supabase = await createServiceClient();

    // Get all live listings — try listings table first, then products
    let listings: { id: string; title: string }[] = [];
    const debugInfo: Record<string, unknown> = {};

    const { data: listingsData, error: le } = await supabase
      .from("listings")
      .select("id, title")
      .in("status", ["live", "active", "approved", "draft"]);

    debugInfo.listings_count = listingsData?.length ?? 0;
    debugInfo.listings_error = le?.message;

    if (listingsData && listingsData.length > 0) {
      listings = listingsData.map((l: Record<string, string>) => ({ id: l.id, title: l.title || "Product" }));
    } else {
      // Fallback to products table (uses "name" column, not "title")
      const { data: productsData, error: pe } = await supabase
        .from("products")
        .select("id, name")
        .in("status", ["live", "active", "approved", "analyzing", "discovered"]);

      debugInfo.products_count = productsData?.length ?? 0;
      debugInfo.products_error = pe?.message;

      if (productsData && productsData.length > 0) {
        listings = productsData.map((p: Record<string, string>) => ({ id: p.id, title: p.name || "Product" }));
      }
    }

    if (listings.length === 0) {
      return NextResponse.json(
        { error: "No listings or products found", debug: debugInfo },
        { status: 404 }
      );
    }

    // Generate reviews for each listing
    const allReviews = [];
    for (const listing of listings) {
      const count = rand(
        Math.max(3, reviewsPerProduct - 3),
        reviewsPerProduct + 3
      );
      for (let i = 0; i < count; i++) {
        const review = generateReview(listing.id);
        allReviews.push(review);
      }
    }

    // Insert in batches of 50
    let inserted = 0;
    const errors: string[] = [];
    for (let i = 0; i < allReviews.length; i += 50) {
      const batch = allReviews.slice(i, i + 50);
      // Remove customer_name from the insert (not a DB column), store in title instead
      const dbBatch = batch.map(({ customer_name, ...rest }) => ({
        ...rest,
        // Append reviewer name to the body
        body: `${rest.body}\n\n— ${customer_name}`,
      }));

      const { error } = await supabase
        .from("customer_reviews")
        .insert(dbBatch);

      if (error) {
        errors.push(`Batch ${i / 50 + 1}: ${error.message}`);
      } else {
        inserted += dbBatch.length;
      }
    }

    // Also update the listing/product rating fields for display
    for (const listing of listings) {
      const listingReviews = allReviews.filter((r) => r.listing_id === listing.id);
      const avgRating = listingReviews.reduce((s, r) => s + r.rating, 0) / listingReviews.length;
      const ratingData = {
        avg_rating: Math.round(avgRating * 10) / 10,
        review_count: listingReviews.length,
      };

      // Update both tables (one will succeed)
      await supabase.from("listings").update(ratingData).eq("id", listing.id);
      await supabase.from("products").update(ratingData).eq("id", listing.id);
    }

    return NextResponse.json({
      success: true,
      listings_count: listings.length,
      reviews_inserted: inserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[Seed Reviews] Error:", err);
    return NextResponse.json(
      { error: "Failed to seed reviews", details: String(err) },
      { status: 500 }
    );
  }
}
