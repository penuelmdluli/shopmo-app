// Email Marketing System for ShopMO
// Collects emails from multiple touchpoints and manages automated campaigns
// Integrations: Resend, SendGrid, or any SMTP provider

export interface EmailSubscriber {
  email: string;
  name?: string;
  source: EmailSource;
  subscribed_at: string;
  coupon_code?: string;
  tags: string[];
}

export type EmailSource =
  | "spin_wheel"
  | "exit_intent"
  | "newsletter"
  | "checkout"
  | "gift_card"
  | "account_signup"
  | "price_alert"
  | "back_in_stock";

export type CampaignType =
  | "welcome_series"
  | "abandoned_cart"
  | "post_purchase"
  | "win_back"
  | "price_drop"
  | "back_in_stock"
  | "birthday"
  | "vip_exclusive"
  | "flash_sale"
  | "review_request";

// ============================================
// Email Templates
// ============================================

export const EMAIL_TEMPLATES: Record<CampaignType, {
  subject: string;
  preheader: string;
  delay_hours: number;
  description: string;
}> = {
  welcome_series: {
    subject: "Welcome to ShopMO! Here's your {{discount}} off 🎉",
    preheader: "Your exclusive discount code is inside",
    delay_hours: 0,
    description: "Sent immediately when a new subscriber joins",
  },
  abandoned_cart: {
    subject: "You left something behind! Complete your order 🛒",
    preheader: "Your cart items are waiting for you",
    delay_hours: 1,
    description: "Triggered 1 hour after cart abandonment",
  },
  post_purchase: {
    subject: "Thank you for your order, {{name}}! 📦",
    preheader: "Here's what to expect next",
    delay_hours: 0,
    description: "Sent immediately after successful purchase",
  },
  win_back: {
    subject: "We miss you! Here's 15% off to welcome you back 💛",
    preheader: "It's been a while - here's a special offer",
    delay_hours: 720, // 30 days
    description: "Sent to customers inactive for 30+ days",
  },
  price_drop: {
    subject: "Price Drop Alert! {{product}} is now {{price}} 🔥",
    preheader: "A product you were watching just dropped in price",
    delay_hours: 0,
    description: "Triggered when a wishlisted product drops in price",
  },
  back_in_stock: {
    subject: "It's back! {{product}} is available again ✅",
    preheader: "The item you wanted is back in stock",
    delay_hours: 0,
    description: "Triggered when an out-of-stock item returns",
  },
  birthday: {
    subject: "Happy Birthday, {{name}}! 🎂 Here's a gift from ShopMO",
    preheader: "Enjoy 20% off on your special day",
    delay_hours: 0,
    description: "Sent on customer's birthday",
  },
  vip_exclusive: {
    subject: "VIP Early Access: New arrivals just for you ⭐",
    preheader: "Shop before everyone else",
    delay_hours: 0,
    description: "Sent to top customers with early access to new products",
  },
  flash_sale: {
    subject: "⚡ FLASH SALE: Up to 50% off - 24 hours only!",
    preheader: "Don't miss these deals - they end at midnight",
    delay_hours: 0,
    description: "Broadcast to all subscribers during flash sales",
  },
  review_request: {
    subject: "How was your {{product}}? Leave a review ⭐",
    preheader: "Your feedback helps other shoppers",
    delay_hours: 168, // 7 days after delivery
    description: "Sent 7 days after order delivery",
  },
};

// ============================================
// Automated Campaign Sequences
// ============================================

export interface CampaignSequence {
  name: string;
  trigger: string;
  emails: {
    template: CampaignType;
    delay_hours: number;
    condition?: string;
  }[];
}

export const CAMPAIGN_SEQUENCES: CampaignSequence[] = [
  {
    name: "Welcome Series",
    trigger: "new_subscriber",
    emails: [
      { template: "welcome_series", delay_hours: 0 },
      { template: "flash_sale", delay_hours: 72, condition: "has_not_purchased" },
      { template: "win_back", delay_hours: 168, condition: "has_not_purchased" },
    ],
  },
  {
    name: "Abandoned Cart Recovery",
    trigger: "cart_abandoned",
    emails: [
      { template: "abandoned_cart", delay_hours: 1 },
      { template: "abandoned_cart", delay_hours: 24, condition: "cart_still_active" },
      { template: "abandoned_cart", delay_hours: 72, condition: "cart_still_active" },
    ],
  },
  {
    name: "Post-Purchase Flow",
    trigger: "order_completed",
    emails: [
      { template: "post_purchase", delay_hours: 0 },
      { template: "review_request", delay_hours: 168 },
      { template: "vip_exclusive", delay_hours: 720, condition: "is_repeat_customer" },
    ],
  },
  {
    name: "Win-Back Campaign",
    trigger: "customer_inactive_30d",
    emails: [
      { template: "win_back", delay_hours: 0 },
      { template: "flash_sale", delay_hours: 168, condition: "has_not_returned" },
    ],
  },
];

// ============================================
// Subscriber Management (localStorage for MVP)
// ============================================

const SUBSCRIBERS_KEY = "shopmo_email_subscribers";

export function getSubscribers(): EmailSubscriber[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(SUBSCRIBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSubscriber(email: string, source: EmailSource, options?: {
  name?: string;
  coupon_code?: string;
  tags?: string[];
}): EmailSubscriber {
  const subscribers = getSubscribers();

  // Check if already subscribed
  const existing = subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // Update source tags
    if (!existing.tags.includes(source)) {
      existing.tags.push(source);
    }
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
    return existing;
  }

  const subscriber: EmailSubscriber = {
    email: email.toLowerCase().trim(),
    name: options?.name,
    source,
    subscribed_at: new Date().toISOString(),
    coupon_code: options?.coupon_code,
    tags: [source, ...(options?.tags || [])],
  };

  subscribers.push(subscriber);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));

  return subscriber;
}

export function isSubscribed(email: string): boolean {
  const subscribers = getSubscribers();
  return subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase());
}

export function getSubscriberCount(): number {
  return getSubscribers().length;
}

export function getSubscribersBySource(source: EmailSource): EmailSubscriber[] {
  return getSubscribers().filter((s) => s.source === source);
}

// ============================================
// Email Analytics (localStorage for MVP)
// ============================================

export interface EmailEvent {
  type: "sent" | "opened" | "clicked" | "unsubscribed";
  email: string;
  campaign: CampaignType;
  timestamp: string;
}

const EVENTS_KEY = "shopmo_email_events";

export function trackEmailEvent(event: Omit<EmailEvent, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const events: EmailEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    events.push({ ...event, timestamp: new Date().toISOString() });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Silently fail
  }
}

export function getEmailStats(): {
  total_subscribers: number;
  emails_sent: number;
  open_rate: number;
  click_rate: number;
  sources: Record<string, number>;
} {
  const subscribers = getSubscribers();
  const events: EmailEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");

  const sent = events.filter((e) => e.type === "sent").length;
  const opened = events.filter((e) => e.type === "opened").length;
  const clicked = events.filter((e) => e.type === "clicked").length;

  const sources: Record<string, number> = {};
  subscribers.forEach((s) => {
    sources[s.source] = (sources[s.source] || 0) + 1;
  });

  return {
    total_subscribers: subscribers.length,
    emails_sent: sent,
    open_rate: sent > 0 ? (opened / sent) * 100 : 0,
    click_rate: sent > 0 ? (clicked / sent) * 100 : 0,
    sources,
  };
}

// ============================================
// Customer Segmentation
// ============================================

export type CustomerSegment =
  | "new_subscriber"      // Just signed up, no purchase
  | "first_time_buyer"    // Made 1 purchase
  | "repeat_customer"     // 2+ purchases
  | "vip_customer"        // 5+ purchases or R5000+ total
  | "at_risk"             // No purchase in 30+ days
  | "churned"             // No activity in 60+ days
  | "deal_hunter"         // Only buys on sale
  | "high_value";         // Average order > R1000

export function getCustomerSegment(
  totalOrders: number,
  totalSpent: number,
  lastOrderDays: number,
  avgOrderValue: number,
  onlySaleItems: boolean
): CustomerSegment {
  if (lastOrderDays > 60) return "churned";
  if (lastOrderDays > 30) return "at_risk";
  if (onlySaleItems) return "deal_hunter";
  if (totalOrders >= 5 || totalSpent >= 5000) return "vip_customer";
  if (avgOrderValue > 1000) return "high_value";
  if (totalOrders >= 2) return "repeat_customer";
  if (totalOrders === 1) return "first_time_buyer";
  return "new_subscriber";
}

// Segment-specific coupon strategy (protect margins!)
export const SEGMENT_COUPONS: Record<CustomerSegment, {
  discount: string;
  code: string;
  description: string;
}> = {
  new_subscriber: { discount: "10%", code: "WELCOME10", description: "Welcome discount for first purchase" },
  first_time_buyer: { discount: "Free Shipping", code: "FREESHIP2", description: "Free shipping on next order" },
  repeat_customer: { discount: "5%", code: "LOYAL5", description: "Loyalty reward" },
  vip_customer: { discount: "15%", code: "VIP15", description: "VIP exclusive discount" },
  at_risk: { discount: "15%", code: "COMEBACK15", description: "We miss you discount" },
  churned: { discount: "20%", code: "RETURN20", description: "Big win-back offer" },
  deal_hunter: { discount: "Free Shipping", code: "DEALSHIP", description: "Free shipping to convert" },
  high_value: { discount: "10%", code: "ELITE10", description: "High-value customer perk" },
};
