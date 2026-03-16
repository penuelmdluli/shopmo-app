import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getListings, getDeals, getReviews } from "@/lib/supabase/queries";
import { MOCK_LISTINGS, MOCK_DEALS, MOCK_REVIEWS } from "@/lib/mock-data";

async function buildCatalogue() {
  const listings = await getListings();
  const deals = await getDeals();

  const catalogue = await Promise.all(listings.map(async (l) => {
    const reviews = await getReviews(l.id);
    const topReview = reviews.sort((a, b) => b.helpful_count - a.helpful_count)[0];
    return `PRODUCT: ${l.title}
  Price: R${l.current_price} (was R${l.original_price}, save R${(l.original_price || 0) - l.current_price} = ${Math.round((((l.original_price || 0) - l.current_price) / (l.original_price || 1)) * 100)}% off)
  Category: ${l.category} | Brand: ${l.brand}
  Rating: ${l.rating_average}/5 (${l.rating_count} reviews)
  Stock: ${l.stock_quantity} units | Status: ${l.is_in_stock ? "IN STOCK" : "OUT OF STOCK"}
  Link: /products/${l.slug}
  Description: ${l.description}
  Specs: ${Object.entries(l.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", ")}
  Tags: ${l.tags.join(", ")}
  ${topReview ? `Top Review: "${topReview.title}" by ${topReview.customer?.full_name} — "${topReview.body}" (${topReview.helpful_count} found helpful)` : ""}`;
  }));

  const dealsInfo = deals.map(d =>
    `DEAL: ${d.listing?.title} | FLASH SALE R${d.deal_price} (was R${d.original_price}) | ${d.discount_percentage}% OFF | ${(d.quantity_available ?? 0) - d.quantity_sold} left out of ${d.quantity_available}! | Link: /products/${d.listing?.slug}`
  ).join("\n");

  return { catalogue: catalogue.join("\n\n"), dealsInfo, listings };
}

function buildSystemPrompt(catalogue: string, dealsInfo: string) {
  return `You are ShopMO AI — the #1 AI shopping assistant and FULL customer service agent for ShopMO, South Africa's smartest online store.

YOU ARE THE ENTIRE CUSTOMER SERVICE DEPARTMENT. You handle EVERYTHING:

═══════════════════════════════════════
🛒 ROLE 1: SALES CLOSER (PRIMARY)
═══════════════════════════════════════
Your #1 job is to CLOSE SALES. Every conversation should move towards a purchase.
- Recommend products based on what the customer describes
- Create urgency: mention limited stock, how many people are viewing, trending status
- Overcome objections: price concerns → show savings, quality concerns → share reviews
- Cross-sell and upsell: "This pairs perfectly with..." "Customers also bought..."
- ALWAYS provide clickable product links: [Product Name](/products/slug)
- ALWAYS end with a clear call to action

═══════════════════════════════════════
🔍 ROLE 2: PRODUCT HUNTER
═══════════════════════════════════════
If a customer asks for a product we DON'T have:
1. Acknowledge their request warmly
2. Suggest the CLOSEST alternatives from our catalogue
3. Say: "I've noted your request! Our team is always sourcing new products — I'll flag this as a high-demand item. In the meantime, here's what I'd recommend..."
4. Ask questions to understand what they really need — colour? size? budget? use case?
5. NEVER say "we don't have that" and leave it. ALWAYS offer alternatives and ALWAYS try to sell something

═══════════════════════════════════════
📦 ROLE 3: ORDER & DELIVERY SUPPORT
═══════════════════════════════════════
- Help customers track orders: "Please share your order number and I'll look it up"
- Explain shipping options, delivery times, costs
- Help with address questions (SA provinces, Pargo pickup points)
- Explain checkout process step by step
- Help with payment method selection

═══════════════════════════════════════
🔄 ROLE 4: RETURNS & COMPLAINTS
═══════════════════════════════════════
- Handle complaints with empathy and speed
- Explain our 30-day return policy
- Never argue — always resolve, then redirect to another purchase
- Turn negative experiences into positive ones: "Let us make it right — and here's a 10% discount code: SHOPMO10"

═══════════════════════════════════════
💡 ROLE 5: PRODUCT ADVISOR
═══════════════════════════════════════
- Help customers choose between products (comparison)
- Answer technical questions about specs
- Share real customer reviews as social proof
- Give honest, helpful advice that builds trust (trust → more sales)
- Suggest gift ideas, budget picks, premium picks

═══════════════════════════════════════
📊 ROLE 6: DEMAND INTELLIGENCE
═══════════════════════════════════════
- When customers ask for products we don't have, respond with:
  "Great taste! I'm logging this as a product request. We're always expanding our catalogue based on what customers want. Can I get your email so we notify you when it's available?"
- Extract useful info: what products customers want, price expectations, why they want it
- This data helps us import and stock the RIGHT products

═══════════════════════════════════════
YOUR PERSONALITY
═══════════════════════════════════════
- Warm, friendly South African English — use "hey", "no worries", "sorted", "lekker", "shame" naturally
- Enthusiastic about products without being pushy
- Empathetic with complaints
- Quick and efficient — don't waste their time
- Professional but personable — like chatting with a smart friend who works at the store
- NEVER say "I can't help with that" — you ALWAYS find a way

═══════════════════════════════════════
CURRENT PRODUCT CATALOGUE
═══════════════════════════════════════
${catalogue}

═══════════════════════════════════════
ACTIVE DEALS
═══════════════════════════════════════
${dealsInfo}

═══════════════════════════════════════
SHIPPING & DELIVERY
═══════════════════════════════════════
- FREE delivery on orders over R500
- Standard: R65, 3-5 business days (The Courier Guy)
- Express: R99, 1-2 business days (The Courier Guy)
- Same-day: R149, delivered today if ordered before 12pm
- Pargo Pickup: R45, 4000+ locations (Checkers, Shell, PEP stores)
- All couriers: The Courier Guy, Pargo, Fastway, Aramex, Bob Go
- We deliver to ALL 9 provinces in South Africa

═══════════════════════════════════════
PAYMENT METHODS
═══════════════════════════════════════
- Credit/Debit Card: Visa, Mastercard, Amex (via PayFast)
- EFT Bank Transfer (via PayFast)
- Instant EFT (via Ozow) — pay instantly from your bank app
- SnapScan — scan QR code to pay
- Mobicred — buy now, pay later in installments
- ALL payments secured with SSL encryption

═══════════════════════════════════════
POLICIES
═══════════════════════════════════════
- 30-day hassle-free returns (items must be unused, in original packaging)
- Full refund or exchange, customer's choice
- All products have manufacturer warranty
- We price-match if you find it cheaper elsewhere
- Promo code SHOPMO10 = 10% off first order (use sparingly to close difficult sales)

═══════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════
- Keep responses SHORT and punchy (2-4 paragraphs max)
- Product links: **[Product Name](/products/slug)** — R price
- Bold important info with **bold**
- Use 1-2 emojis max per message (natural, not forced)
- ALWAYS end with a question or call to action
- When comparing products, use a clear format
- Share real customer review quotes as social proof
- Format prices as R XXX (South African Rand)
- Never write walls of text — customers will scroll away`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({
        response: getOfflineResponse(messages[messages.length - 1]?.content || ""),
      });
    }

    const { catalogue, dealsInfo } = await buildCatalogue();
    const systemPrompt = buildSystemPrompt(catalogue, dealsInfo);

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find(c => c.type === "text");
    return Response.json({
      response: textContent?.text || "I'm here to help! What are you looking for today?",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({
      response: getOfflineResponse(""),
    });
  }
}

function getOfflineResponse(message: string): string {
  const q = message.toLowerCase();
  const words = q.split(/\s+/);

  // Smart keyword matching across all products
  const scored = MOCK_LISTINGS.map(l => {
    let score = 0;
    const text = `${l.title} ${l.description} ${l.category} ${l.tags.join(" ")}`.toLowerCase();
    for (const word of words) {
      if (word.length < 3) continue;
      if (text.includes(word)) score += 2;
      if (l.title.toLowerCase().includes(word)) score += 3;
      if (l.tags.some(t => t.includes(word))) score += 2;
    }
    return { listing: l, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    const top = scored.slice(0, 3);
    const recs = top.map(({ listing: l }) => {
      const savings = (l.original_price || 0) - l.current_price;
      const review = MOCK_REVIEWS.find(r => r.listing_id === l.id);
      let rec = `**[${l.title}](/products/${l.slug})** — R${l.current_price}`;
      if (savings > 0) rec += ` (save R${savings}!)`;
      rec += ` ⭐ ${l.rating_average}/5`;
      if (review) rec += `\n_"${review.title}" — ${review.customer?.full_name}_`;
      return rec;
    }).join("\n\n");
    return `Here's what I found for you:\n\n${recs}\n\nWant me to tell you more about any of these? I can also help you compare them!`;
  }

  // Budget queries
  if (q.includes("under") || q.includes("budget") || q.includes("cheap") || q.includes("affordable")) {
    const budget = parseInt(q.match(/\d+/)?.[0] || "300");
    const affordable = MOCK_LISTINGS.filter(l => l.current_price <= budget).sort((a, b) => b.rating_average - a.rating_average).slice(0, 3);
    if (affordable.length > 0) {
      const recs = affordable.map(l => `**[${l.title}](/products/${l.slug})** — R${l.current_price} ⭐ ${l.rating_average}/5`).join("\n\n");
      return `Great picks under R${budget}:\n\n${recs}\n\nAll of these are bestsellers! Which one catches your eye?`;
    }
  }

  // Gift queries
  if (q.includes("gift") || q.includes("present") || q.includes("birthday")) {
    const gifts = MOCK_LISTINGS.filter(l => l.rating_average >= 4.5).sort((a, b) => b.rating_count - a.rating_count).slice(0, 3);
    const recs = gifts.map(l => `**[${l.title}](/products/${l.slug})** — R${l.current_price} ⭐ ${l.rating_average}/5 (${l.rating_count} reviews)`).join("\n\n");
    return `Here are our top-rated gift picks 🎁:\n\n${recs}\n\nThese are our most loved products — perfect for gifting! Who's the lucky person?`;
  }

  // Deals
  if (q.includes("deal") || q.includes("sale") || q.includes("discount") || q.includes("special")) {
    const deals = MOCK_DEALS.map(d => `**[${d.listing?.title}](/products/${d.listing?.slug})** — R${d.deal_price} (was R${d.original_price}, ${d.discount_percentage}% OFF!) — Only ${(d.quantity_available ?? 0) - d.quantity_sold} left!`).join("\n\n");
    return `Our current deals are 🔥:\n\n${deals}\n\nThese are selling fast — which one do you want before they're gone?`;
  }

  // Shipping
  if (q.includes("delivery") || q.includes("shipping") || q.includes("courier")) {
    return "We deliver nationwide across all 9 SA provinces! 🚚\n\n- **Free delivery** on orders over R500\n- **Standard**: R65 (3-5 days)\n- **Express**: R99 (1-2 days)\n- **Same-day**: R149 (before 12pm)\n- **Pargo pickup**: R45 (4000+ Checkers, Shell, PEP locations)\n\nWant to start shopping? Check our [trending products](/products)!";
  }

  // Returns
  if (q.includes("return") || q.includes("refund") || q.includes("exchange")) {
    return "No stress at all! We have a **30-day hassle-free return policy**.\n\nJust reach out and we'll arrange everything — full refund or exchange, your choice. Items must be unused and in original packaging.\n\nNeed help with anything else? Here's a **10% off** code for your next order: **SHOPMO10** 🎉";
  }

  // Payment
  if (q.includes("payment") || q.includes("pay") || q.includes("eft") || q.includes("card")) {
    return "We accept all major payment methods:\n\n- 💳 **Credit/Debit Card** (Visa, Mastercard, Amex)\n- 🏦 **EFT** & **Instant EFT** (via Ozow)\n- 📱 **SnapScan** (QR code payment)\n- 🛒 **Mobicred** (buy now, pay later)\n\nAll secured with SSL encryption. Ready to check out? Visit your [cart](/cart)!";
  }

  // Order tracking
  if (q.includes("track") || q.includes("order") || q.includes("where") || q.includes("status")) {
    return "I can help you track your order! 📦\n\nPlease share your **order number** (starts with SM-) and I'll look up the status for you.\n\nYou can also track directly at [Track Order](/track).\n\nDon't have your order number? Check your email for the confirmation.";
  }

  // Complaint
  if (q.includes("complain") || q.includes("broken") || q.includes("wrong") || q.includes("damaged") || q.includes("unhappy") || q.includes("problem")) {
    return "I'm really sorry to hear that! 😔 Your satisfaction is our #1 priority.\n\nPlease share your **order number** and describe the issue — I'll escalate this immediately and we'll make it right.\n\nAs a gesture, here's **10% off** your next order: **SHOPMO10**. We value you as a customer!";
  }

  // Default — warm greeting with suggestions
  return "Hey there! 👋 I'm **ShopMO AI** — your personal shopping assistant AND full customer service team, all in one.\n\nI can help you with:\n- 🛒 Finding the perfect product\n- 💰 Getting the best deals\n- 📦 Tracking your order\n- 🔄 Returns & exchanges\n- 🎁 Gift recommendations\n\nWhat can I help you with today?";
}
