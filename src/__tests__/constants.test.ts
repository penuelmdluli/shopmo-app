import { describe, it, expect } from "vitest";
import {
  SITE_NAME,
  CATEGORIES,
  VALUE_PROPOSITIONS,
  SHIPPING_PROVIDERS,
  PAYMENT_METHODS,
  ORDER_STATUSES,
  FREE_SHIPPING_THRESHOLD,
  VAT_RATE,
} from "@/lib/constants";

describe("Site Constants", () => {
  it("has correct site name", () => {
    expect(SITE_NAME).toBe("ShopMO");
  });

  it("free shipping threshold is R500", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(500);
  });

  it("VAT rate is 15%", () => {
    expect(VAT_RATE).toBe(0.15);
  });
});

describe("CATEGORIES", () => {
  it("has 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("each category has required fields", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty("name");
      expect(cat).toHaveProperty("slug");
      expect(cat).toHaveProperty("icon");
      expect(cat).toHaveProperty("image");
      expect(cat.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("includes Electronics", () => {
    expect(CATEGORIES.some((c) => c.slug === "electronics")).toBe(true);
  });

  it("includes Fashion", () => {
    expect(CATEGORIES.some((c) => c.slug === "fashion")).toBe(true);
  });
});

describe("VALUE_PROPOSITIONS", () => {
  it("has 4 value propositions", () => {
    expect(VALUE_PROPOSITIONS).toHaveLength(4);
  });

  it("includes Free Delivery", () => {
    expect(VALUE_PROPOSITIONS.some((v) => v.title === "Free Delivery")).toBe(true);
  });

  it("includes Secure Checkout", () => {
    expect(VALUE_PROPOSITIONS.some((v) => v.title === "Secure Checkout")).toBe(true);
  });
});

describe("SHIPPING_PROVIDERS", () => {
  it("has 5 shipping providers", () => {
    expect(SHIPPING_PROVIDERS).toHaveLength(5);
  });

  it("includes Pargo for pickup", () => {
    const pargo = SHIPPING_PROVIDERS.find((p) => p.id === "pargo");
    expect(pargo).toBeDefined();
    expect(pargo?.type).toBe("pickup");
  });

  it("includes Bob Go as aggregator", () => {
    const bobgo = SHIPPING_PROVIDERS.find((p) => p.id === "bobgo");
    expect(bobgo).toBeDefined();
    expect(bobgo?.type).toBe("aggregator");
  });
});

describe("PAYMENT_METHODS", () => {
  it("has 4 payment methods", () => {
    expect(PAYMENT_METHODS).toHaveLength(4);
  });

  it("each method has required fields", () => {
    PAYMENT_METHODS.forEach((method) => {
      expect(method).toHaveProperty("id");
      expect(method).toHaveProperty("name");
      expect(method).toHaveProperty("provider");
      expect(method).toHaveProperty("icon");
    });
  });
});

describe("ORDER_STATUSES", () => {
  it("has all expected statuses", () => {
    const expectedStatuses = [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ];
    expectedStatuses.forEach((status) => {
      expect(ORDER_STATUSES).toHaveProperty(status);
    });
  });

  it("each status has label and color", () => {
    Object.values(ORDER_STATUSES).forEach((status) => {
      expect(status).toHaveProperty("label");
      expect(status).toHaveProperty("color");
      expect(status.label).toBeTruthy();
      expect(status.color).toBeTruthy();
    });
  });
});
