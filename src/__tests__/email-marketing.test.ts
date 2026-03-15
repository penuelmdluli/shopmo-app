import { describe, it, expect, beforeEach } from "vitest";
import {
  addSubscriber,
  getSubscribers,
  isSubscribed,
  getSubscriberCount,
  getSubscribersBySource,
  getCustomerSegment,
  EMAIL_TEMPLATES,
  CAMPAIGN_SEQUENCES,
  SEGMENT_COUPONS,
} from "@/lib/email-marketing";

describe("Email Marketing - Subscriber Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a new subscriber", () => {
    const sub = addSubscriber("test@example.com", "newsletter");
    expect(sub.email).toBe("test@example.com");
    expect(sub.source).toBe("newsletter");
    expect(sub.tags).toContain("newsletter");
  });

  it("normalizes email to lowercase", () => {
    const sub = addSubscriber("TEST@Example.COM", "newsletter");
    expect(sub.email).toBe("test@example.com");
  });

  it("prevents duplicate subscribers", () => {
    addSubscriber("test@example.com", "newsletter");
    addSubscriber("test@example.com", "spin_wheel");

    expect(getSubscriberCount()).toBe(1);
    const subs = getSubscribers();
    expect(subs[0].tags).toContain("newsletter");
    expect(subs[0].tags).toContain("spin_wheel");
  });

  it("checks if email is subscribed", () => {
    addSubscriber("test@example.com", "newsletter");
    expect(isSubscribed("test@example.com")).toBe(true);
    expect(isSubscribed("other@example.com")).toBe(false);
  });

  it("case-insensitive subscription check", () => {
    addSubscriber("test@example.com", "newsletter");
    expect(isSubscribed("TEST@EXAMPLE.COM")).toBe(true);
  });

  it("counts subscribers", () => {
    addSubscriber("a@test.com", "newsletter");
    addSubscriber("b@test.com", "spin_wheel");
    addSubscriber("c@test.com", "exit_intent");
    expect(getSubscriberCount()).toBe(3);
  });

  it("filters subscribers by source", () => {
    addSubscriber("a@test.com", "newsletter");
    addSubscriber("b@test.com", "spin_wheel");
    addSubscriber("c@test.com", "newsletter");

    const newsletterSubs = getSubscribersBySource("newsletter");
    expect(newsletterSubs).toHaveLength(2);
  });

  it("stores coupon code with subscriber", () => {
    const sub = addSubscriber("test@example.com", "spin_wheel", {
      coupon_code: "SPIN10",
    });
    expect(sub.coupon_code).toBe("SPIN10");
  });

  it("stores custom tags", () => {
    const sub = addSubscriber("test@example.com", "newsletter", {
      tags: ["footer_signup", "homepage"],
    });
    expect(sub.tags).toContain("footer_signup");
    expect(sub.tags).toContain("homepage");
    expect(sub.tags).toContain("newsletter");
  });
});

describe("Email Marketing - Customer Segmentation", () => {
  it("identifies new subscribers", () => {
    expect(getCustomerSegment(0, 0, 0, 0, false)).toBe("new_subscriber");
  });

  it("identifies first-time buyers", () => {
    expect(getCustomerSegment(1, 500, 5, 500, false)).toBe("first_time_buyer");
  });

  it("identifies repeat customers", () => {
    expect(getCustomerSegment(3, 1500, 10, 500, false)).toBe("repeat_customer");
  });

  it("identifies VIP customers by order count", () => {
    expect(getCustomerSegment(5, 3000, 5, 600, false)).toBe("vip_customer");
  });

  it("identifies VIP customers by total spent", () => {
    expect(getCustomerSegment(3, 5500, 5, 1833, false)).toBe("vip_customer");
  });

  it("identifies at-risk customers", () => {
    expect(getCustomerSegment(2, 1000, 45, 500, false)).toBe("at_risk");
  });

  it("identifies churned customers", () => {
    expect(getCustomerSegment(2, 1000, 90, 500, false)).toBe("churned");
  });

  it("identifies deal hunters", () => {
    expect(getCustomerSegment(3, 900, 10, 300, true)).toBe("deal_hunter");
  });

  it("identifies high-value customers", () => {
    expect(getCustomerSegment(2, 3000, 10, 1500, false)).toBe("high_value");
  });

  it("churned takes priority over other segments", () => {
    // Even a VIP who hasn't ordered in 60+ days is churned
    expect(getCustomerSegment(10, 10000, 65, 1000, false)).toBe("churned");
  });
});

describe("Email Templates", () => {
  it("has all required campaign types", () => {
    const expectedTypes = [
      "welcome_series",
      "abandoned_cart",
      "post_purchase",
      "win_back",
      "price_drop",
      "back_in_stock",
      "birthday",
      "vip_exclusive",
      "flash_sale",
      "review_request",
    ];
    expectedTypes.forEach((type) => {
      expect(EMAIL_TEMPLATES).toHaveProperty(type);
    });
  });

  it("each template has subject, preheader, and delay", () => {
    Object.values(EMAIL_TEMPLATES).forEach((template) => {
      expect(template.subject).toBeTruthy();
      expect(template.preheader).toBeTruthy();
      expect(typeof template.delay_hours).toBe("number");
      expect(template.delay_hours).toBeGreaterThanOrEqual(0);
    });
  });

  it("welcome email has zero delay", () => {
    expect(EMAIL_TEMPLATES.welcome_series.delay_hours).toBe(0);
  });

  it("abandoned cart email has 1 hour delay", () => {
    expect(EMAIL_TEMPLATES.abandoned_cart.delay_hours).toBe(1);
  });

  it("win-back email has 30 day delay", () => {
    expect(EMAIL_TEMPLATES.win_back.delay_hours).toBe(720);
  });

  it("review request email has 7 day delay", () => {
    expect(EMAIL_TEMPLATES.review_request.delay_hours).toBe(168);
  });
});

describe("Campaign Sequences", () => {
  it("has at least 4 sequences", () => {
    expect(CAMPAIGN_SEQUENCES.length).toBeGreaterThanOrEqual(4);
  });

  it("Welcome Series starts immediately", () => {
    const welcome = CAMPAIGN_SEQUENCES.find((s) => s.name === "Welcome Series");
    expect(welcome).toBeDefined();
    expect(welcome?.emails[0].delay_hours).toBe(0);
  });

  it("Abandoned Cart sequence has escalation", () => {
    const cart = CAMPAIGN_SEQUENCES.find((s) => s.name === "Abandoned Cart Recovery");
    expect(cart).toBeDefined();
    expect(cart!.emails.length).toBeGreaterThanOrEqual(2);
    // Each email has increasing delay
    for (let i = 1; i < cart!.emails.length; i++) {
      expect(cart!.emails[i].delay_hours).toBeGreaterThan(cart!.emails[i - 1].delay_hours);
    }
  });

  it("Post-Purchase includes review request", () => {
    const postPurchase = CAMPAIGN_SEQUENCES.find((s) => s.name === "Post-Purchase Flow");
    expect(postPurchase).toBeDefined();
    const hasReview = postPurchase!.emails.some((e) => e.template === "review_request");
    expect(hasReview).toBe(true);
  });
});

describe("Segment Coupons", () => {
  it("every segment has a coupon", () => {
    const segments = [
      "new_subscriber",
      "first_time_buyer",
      "repeat_customer",
      "vip_customer",
      "at_risk",
      "churned",
      "deal_hunter",
      "high_value",
    ] as const;

    segments.forEach((segment) => {
      expect(SEGMENT_COUPONS[segment]).toBeDefined();
      expect(SEGMENT_COUPONS[segment].code).toBeTruthy();
      expect(SEGMENT_COUPONS[segment].discount).toBeTruthy();
    });
  });

  it("churned customers get bigger discounts than loyal ones", () => {
    // Churned gets 20%, repeat gets 5%
    expect(SEGMENT_COUPONS.churned.discount).toBe("20%");
    expect(SEGMENT_COUPONS.repeat_customer.discount).toBe("5%");
  });

  it("VIP customers get exclusive discount", () => {
    expect(SEGMENT_COUPONS.vip_customer.discount).toBe("15%");
  });

  it("new subscribers get welcome discount", () => {
    expect(SEGMENT_COUPONS.new_subscriber.code).toBe("WELCOME10");
  });
});
