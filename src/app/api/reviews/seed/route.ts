import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * POST /api/reviews/seed
 * Seeds realistic reviews for all products to drive social proof.
 * Creates a "guest" customer record + reviews with varied ratings/content.
 */

const REVIEWER_NAMES = [
  "Thabo M.", "Naledi K.", "Sipho N.", "Lerato D.", "Kabelo T.",
  "Zanele P.", "Bongani S.", "Nomsa W.", "Mandla J.", "Lindiwe R.",
  "Jacques V.", "Anele M.", "Precious G.", "David L.", "Fatima A.",
  "Mpho B.", "Zinhle C.", "Kagiso F.", "Nandi H.", "Tshepo E.",
  "Sarah M.", "Pieter J.", "Ayanda N.", "Rethabile S.", "Thandeka Z.",
];

// Review templates per category - realistic SA consumer reviews
const REVIEW_TEMPLATES: Record<string, { title: string; body: string; rating: number }[]> = {
  Electronics: [
    { title: "Excellent quality!", body: "Works perfectly out of the box. Sound quality is amazing for the price. Would definitely recommend to anyone looking for good electronics.", rating: 5 },
    { title: "Great value for money", body: "Compared prices everywhere and ShopMO had the best deal. Product arrived quickly and works exactly as described. Very happy with my purchase.", rating: 5 },
    { title: "Impressed with build quality", body: "Feels premium in hand. Battery life is great and it charges fast. My friends all want one now!", rating: 4 },
    { title: "Good but minor issue", body: "Product works well overall. Had a small issue with setup but customer service helped me sort it out quickly. Now it works perfectly.", rating: 4 },
    { title: "Solid purchase", body: "Does what it says on the box. Nothing fancy but reliable and well-made. Happy with the purchase.", rating: 4 },
    { title: "Love it!", body: "Been using this for 2 weeks now and it's brilliant. Best tech purchase I've made this year. Fast delivery too!", rating: 5 },
  ],
  "Home & Kitchen": [
    { title: "Game changer in my kitchen!", body: "This has completely changed how I cook. So much easier and faster. The quality is fantastic and it looks great on my counter.", rating: 5 },
    { title: "Perfect for everyday use", body: "Use this every single day. Easy to clean and very durable. Great value compared to what you'd pay at other stores.", rating: 5 },
    { title: "Exactly what I needed", body: "Searched for ages for the right one and this is perfect. Good size, easy to use, and the price was right. Delivered in 3 days!", rating: 4 },
    { title: "Gift for my mom", body: "Bought this as a birthday gift and my mom absolutely loves it! She uses it every day now. Great quality product.", rating: 5 },
    { title: "Decent quality", body: "Does the job well. Packaging was good and it arrived without any damage. Would buy from ShopMO again.", rating: 4 },
  ],
  Fashion: [
    { title: "Looks even better in person!", body: "The photos don't do it justice. Fits perfectly and the material quality is excellent. Already getting compliments!", rating: 5 },
    { title: "Great style, great price", body: "Wasn't sure about ordering fashion online but I'm so glad I did. Perfect fit and looks amazing. Will order more.", rating: 5 },
    { title: "Comfortable and stylish", body: "Worn it several times already and it's super comfortable. The quality is much better than I expected for the price.", rating: 4 },
    { title: "Nice quality", body: "Good stitching and materials. True to size. Arrived well packaged. Happy with this purchase.", rating: 4 },
    { title: "Perfect everyday item", body: "Exactly as pictured. Goes with everything in my wardrobe. Highly recommend!", rating: 5 },
  ],
  "Beauty & Health": [
    { title: "Amazing results!", body: "Started seeing results after just one week. My skin feels so much better. This is now part of my daily routine.", rating: 5 },
    { title: "Best purchase this month", body: "Works exactly as advertised. The quality is professional grade. So happy I found this on ShopMO.", rating: 5 },
    { title: "Really effective", body: "I was sceptical at first but this really works. Great value compared to salon prices. Definitely recommending to friends.", rating: 4 },
    { title: "Good quality product", body: "Does what it's supposed to do. Easy to use and the results are noticeable. Will repurchase when it runs out.", rating: 4 },
    { title: "Love this!", body: "Finally found a product that actually delivers on its promises. My beauty routine is complete. Thank you ShopMO!", rating: 5 },
  ],
  "Sports & Outdoors": [
    { title: "Perfect for my workouts!", body: "Been using this at the gym for 3 weeks now. Excellent quality and very durable. Makes my training sessions so much better.", rating: 5 },
    { title: "Great for fitness enthusiasts", body: "Exactly what I needed to level up my fitness routine. Good quality materials and comfortable to use. Fast delivery!", rating: 5 },
    { title: "Solid and durable", body: "Taken this on multiple outdoor trips and it holds up perfectly. Well-made and worth every rand.", rating: 4 },
    { title: "Good value", body: "Compared to gym brand prices, this is excellent value. Works just as well as the expensive versions.", rating: 4 },
    { title: "Exceeded expectations", body: "Wasn't expecting this quality at this price point. Very impressed. Already recommended to my running club.", rating: 5 },
  ],
  "Toys & Games": [
    { title: "Kids absolutely love it!", body: "Bought this for my son's birthday and he hasn't put it down since. Great quality and very entertaining. Worth every cent!", rating: 5 },
    { title: "Fun for the whole family", body: "We play with this every weekend now. Great way to spend time together. Quality is excellent and it's built to last.", rating: 5 },
    { title: "Perfect gift idea", body: "Gave this as a gift and it was a massive hit! The quality exceeded my expectations. Will definitely buy more from ShopMO.", rating: 5 },
    { title: "Good quality toy", body: "Well-made and safe for kids. Instructions were clear and easy to follow. My children are very happy.", rating: 4 },
    { title: "Hours of entertainment", body: "Keeps the kids busy for hours. Educational and fun. The packaging was also really nice — perfect for gifting.", rating: 4 },
  ],
  Automotive: [
    { title: "Essential for my car", body: "Easy to install and works perfectly. Should have bought this ages ago. Makes driving so much more convenient.", rating: 5 },
    { title: "Great car accessory", body: "Fits perfectly in my car. Good quality build and easy to use. Very happy with the purchase.", rating: 4 },
    { title: "Works as advertised", body: "Does exactly what it says. Installation was quick and straightforward. Good value for the price.", rating: 4 },
    { title: "Must-have for drivers", body: "Every car needs this! Made my daily commute so much better. Highly recommend to all drivers out there.", rating: 5 },
    { title: "Quality product", body: "Impressed with the build quality. Works well even on long road trips. Fast shipping too!", rating: 5 },
  ],
  "Garden & DIY": [
    { title: "Perfect for home projects!", body: "Used this for several DIY projects around the house. Powerful, reliable, and easy to use. Great addition to my toolkit.", rating: 5 },
    { title: "Makes gardening easier", body: "This has made my weekend gardening so much more enjoyable. Good quality and very durable. Highly recommend!", rating: 5 },
    { title: "Solid tool", body: "Well-built and does the job perfectly. Good grip and easy to handle. Worth the investment.", rating: 4 },
    { title: "Great for the price", body: "You'd pay double at hardware stores for this quality. Very happy with ShopMO's pricing. Works like a charm.", rating: 4 },
    { title: "Handy around the house", body: "Use this almost every weekend now. Great build quality and it came with everything I needed.", rating: 5 },
  ],
};

// Generic fallback reviews for any category
const GENERIC_REVIEWS = [
  { title: "Highly recommend!", body: "Excellent product and fast delivery. ShopMO has become my go-to online store. Great service!", rating: 5 },
  { title: "Very happy with purchase", body: "Product arrived quickly and was exactly as described. Good packaging too. Will shop here again.", rating: 5 },
  { title: "Good quality", body: "Solid product for the price. Works well and feels durable. No complaints at all.", rating: 4 },
  { title: "Great experience", body: "Easy ordering process, fast delivery, and the product is great. What more could you ask for?", rating: 5 },
  { title: "Worth every rand", body: "Compared prices and ShopMO had the best deal. Product quality is excellent. Very satisfied customer.", rating: 4 },
];

export async function POST(request: NextRequest) {
  // Protect seed endpoint — only allow with service key
  const authHeader = request.headers.get("authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Get all products (approved/live) to seed reviews for
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, category")
      .in("status", ["approved", "live", "analyzing"]);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({ error: "No products found to seed reviews for" }, { status: 400 });
    }

    // Check if we have a customers table entry, create a guest one if needed
    const { data: existingCustomers } = await supabase
      .from("customers")
      .select("id, full_name")
      .limit(50);

    let customerIds: string[] = [];

    if (existingCustomers && existingCustomers.length > 0) {
      customerIds = existingCustomers.map(c => c.id);
    } else {
      // Create guest reviewer customers
      const customersToCreate = REVIEWER_NAMES.slice(0, 15).map(name => ({
        full_name: name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, "")}@shopmo-reviewer.local`,
        phone: `+2707${Math.floor(10000000 + Math.random() * 90000000)}`,
      }));

      const { data: createdCustomers, error: createError } = await supabase
        .from("customers")
        .insert(customersToCreate)
        .select("id");

      if (createError) {
        console.error("[Reviews Seed] Failed to create customers:", createError);
        return NextResponse.json({ error: "Failed to create reviewer customers", details: createError.message }, { status: 500 });
      }

      customerIds = (createdCustomers || []).map(c => c.id);
    }

    if (customerIds.length === 0) {
      return NextResponse.json({ error: "No customer IDs available" }, { status: 500 });
    }

    // Check existing reviews to avoid duplicates
    const { data: existingReviews } = await supabase
      .from("customer_reviews")
      .select("listing_id")
      .eq("status", "approved");

    const reviewedListingIds = new Set((existingReviews || []).map(r => r.listing_id));

    // Also check for listings (products might not have listings yet)
    const { data: listings } = await supabase
      .from("listings")
      .select("id, product_id")
      .in("status", ["live", "active", "approved"]);

    const listingMap = new Map<string, string>();
    if (listings) {
      listings.forEach(l => {
        if (l.product_id) listingMap.set(l.product_id, l.id);
      });
    }

    let totalSeeded = 0;
    let skipped = 0;
    const results: { product: string; reviews_added: number }[] = [];

    for (const product of products) {
      // Use listing_id if available, otherwise use product.id as listing_id
      const listingId = listingMap.get(product.id) || product.id;

      // Skip if already has reviews
      if (reviewedListingIds.has(listingId)) {
        skipped++;
        continue;
      }

      // Get category-specific reviews or fallback to generic
      const categoryReviews = REVIEW_TEMPLATES[product.category] || GENERIC_REVIEWS;

      // Seed 3-5 reviews per product
      const numReviews = 3 + Math.floor(Math.random() * 3); // 3-5
      const shuffledReviews = [...categoryReviews].sort(() => Math.random() - 0.5);
      const selectedReviews = shuffledReviews.slice(0, numReviews);

      const reviewsToInsert = selectedReviews.map((review, idx) => {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
        // Stagger dates over last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        return {
          customer_id: customerId,
          listing_id: listingId,
          rating: review.rating,
          title: review.title,
          body: review.body,
          images: [],
          is_verified_purchase: Math.random() > 0.3, // 70% verified
          helpful_count: Math.floor(Math.random() * 15),
          status: "approved",
          // Add seller response to ~30% of reviews
          seller_response: idx === 0 && Math.random() > 0.7
            ? "Thank you for your wonderful review! We're so glad you love your purchase. Happy shopping! - ShopMO Team"
            : null,
          seller_responded_at: idx === 0 && Math.random() > 0.7 ? new Date().toISOString() : null,
          created_at: createdAt,
        };
      });

      const { error: insertError } = await supabase
        .from("customer_reviews")
        .insert(reviewsToInsert);

      if (insertError) {
        console.error(`[Reviews Seed] Error seeding reviews for ${product.name}:`, insertError);
        results.push({ product: product.name, reviews_added: 0 });
      } else {
        totalSeeded += reviewsToInsert.length;
        results.push({ product: product.name, reviews_added: reviewsToInsert.length });
      }
    }

    return NextResponse.json({
      success: true,
      total_products: products.length,
      total_reviews_seeded: totalSeeded,
      skipped_already_reviewed: skipped,
      results,
    });
  } catch (err) {
    console.error("[Reviews Seed] Fatal error:", err);
    return NextResponse.json({ error: "Seed failed", details: String(err) }, { status: 500 });
  }
}
