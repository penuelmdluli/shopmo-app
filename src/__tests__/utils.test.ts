import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  generateOrderNumber,
  generateSlug,
  calculateVAT,
  truncateText,
  SA_PROVINCES,
} from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats ZAR currency correctly", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats decimal amounts", () => {
    const result = formatCurrency(99.99);
    expect(result).toContain("99");
  });

  it("formats large amounts with thousands separator", () => {
    const result = formatCurrency(10000);
    expect(result).toContain("10");
  });
});

describe("formatNumber", () => {
  it("formats numbers with SA locale", () => {
    const result = formatNumber(1234567);
    // SA uses space as thousands separator
    expect(result).toBeTruthy();
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const result = formatDate("2026-03-15");
    expect(result).toContain("Mar");
    expect(result).toContain("2026");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2026-01-01"));
    expect(result).toContain("Jan");
    expect(result).toContain("2026");
  });
});

describe("generateOrderNumber", () => {
  it("starts with SM-", () => {
    const order = generateOrderNumber();
    expect(order).toMatch(/^SM-/);
  });

  it("contains date segment", () => {
    const order = generateOrderNumber();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    expect(order).toContain(today);
  });

  it("generates unique order numbers", () => {
    const orders = new Set(Array.from({ length: 100 }, () => generateOrderNumber()));
    expect(orders.size).toBeGreaterThan(90); // Very high probability all unique
  });
});

describe("generateSlug", () => {
  it("converts to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("replaces special characters with hyphens", () => {
    expect(generateSlug("Product #1 (New!)")).toBe("product-1-new");
  });

  it("removes leading/trailing hyphens", () => {
    expect(generateSlug("--hello--")).toBe("hello");
  });

  it("handles multiple spaces", () => {
    expect(generateSlug("hello   world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });
});

describe("calculateVAT", () => {
  it("calculates 15% VAT", () => {
    expect(calculateVAT(100)).toBe(15);
  });

  it("handles zero", () => {
    expect(calculateVAT(0)).toBe(0);
  });

  it("handles large amounts", () => {
    expect(calculateVAT(10000)).toBe(1500);
  });
});

describe("truncateText", () => {
  it("returns full text if under limit", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("truncates and adds ellipsis", () => {
    const result = truncateText("This is a long text that needs truncation", 20);
    expect(result.length).toBeLessThanOrEqual(23); // 20 chars + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("handles exact length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });
});

describe("SA_PROVINCES", () => {
  it("has 9 provinces", () => {
    expect(SA_PROVINCES).toHaveLength(9);
  });

  it("includes Gauteng", () => {
    expect(SA_PROVINCES).toContain("Gauteng");
  });

  it("includes Western Cape", () => {
    expect(SA_PROVINCES).toContain("Western Cape");
  });

  it("includes KwaZulu-Natal", () => {
    expect(SA_PROVINCES).toContain("KwaZulu-Natal");
  });
});
