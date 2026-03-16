import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getListings, getDeals, getReviews } from "@/lib/supabase/queries";

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

  // Product-related queries — direct to browse
  if (q.includes("buy") || q.includes("looking for") || q.includes("want") || q.includes("need") || q.includes("recommend")) {
    return "I'd love to help you find the perfect product! Browse our full catalogue at [All Products](/products) — we have Electronics, Home & Kitchen, Fashion, Beauty, Sports, Toys, Automotive, and Garden & DIY.\n\nWhat category interests you?";
  }

  // Budget queries
  if (q.includes("under") || q.includes("budget") || q.includes("cheap") || q.includes("affordable")) {
    return "We have great deals across all price ranges! Check out our [Products](/products) page — you can sort by price to find the best value.\n\nWhat's your budget? I can help narrow it down!";
  }

  // Gift queries
  if (q.includes("gift") || q.includes("present") || q.includes("birthday")) {
    return "Looking for the perfect gift? Browse our top-rated products at [Shop Now](/products) — we have options across 8 categories.\n\nWho's the lucky person and what's your budget?";
  }

  // Deals
  if (q.includes("deal") || q.includes("sale") || q.includes("discount") || q.includes("special")) {
    return "Check out our latest deals at [Products](/products)! Many items are on sale with big savings.\n\nUse code **SHOPMO10** for 10% off your first order!";
  }

  // Shipping
  if (q.includes("delivery") || q.includes("shipping") || q.includes("courier")) {
    return "We deliver nationwide across all 9 SA provinces!\n\n- **Free delivery** on orders over R500\n- **Standard**: R65 (3-5 days)\n- **Express**: R99 (1-2 days)\n- **Same-day**: R149 (before 12pm)\n- **Pargo pickup**: R45 (4000+ locations)\n\nWant to start shopping? Check our [products](/products)!";
  }

  // Returns
  if (q.includes("return") || q.includes("refund") || q.includes("exchange")) {
    return "No stress at all! We have a **30-day hassle-free return policy**.\n\nJust reach out and we'll arrange everything — full refund or exchange, your choice. Items must be unused and in original packaging.\n\nHere's **10% off** your next order: **SHOPMO10**";
  }

  // Payment
  if (q.includes("payment") || q.includes("pay") || q.includes("eft") || q.includes("card")) {
    return "We accept all major payment methods:\n\n- Credit/Debit Card (Visa, Mastercard, Amex)\n- EFT & Instant EFT (via Ozow)\n- SnapScan (QR code payment)\n- Mobicred (buy now, pay later)\n\nAll secured with SSL encryption. Ready to check out? Visit your [cart](/cart)!";
  }

  // Order tracking
  if (q.includes("track") || q.includes("order") || q.includes("where") || q.includes("status")) {
    return "I can help you track your order!\n\nPlease share your **order number** (starts with SM-) and I'll look it up.\n\nYou can also track directly at [Track Order](/track).";
  }

  // Complaint
  if (q.includes("complain") || q.includes("broken") || q.includes("wrong") || q.includes("damaged") || q.includes("unhappy") || q.includes("problem")) {
    return "I'm really sorry to hear that! Your satisfaction is our #1 priority.\n\nPlease share your **order number** and describe the issue — I'll escalate this immediately.\n\nHere's **10% off** your next order: **SHOPMO10**. We value you as a customer!";
  }

  // Default — warm greeting with suggestions
  return "Hey there! I'm **ShopMO AI** — your personal shopping assistant AND full customer service team, all in one.\n\nI can help you with:\n- Finding the perfect product\n- Getting the best deals\n- Tracking your order\n- Returns & exchanges\n- Gift recommendations\n\nWhat can I help you with today?";
}
