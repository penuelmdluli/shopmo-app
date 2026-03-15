import { describe, it, expect } from "vitest";
import { MOCK_LISTINGS, MOCK_DEALS } from "@/lib/mock-data";

describe("Mock Listings", () => {
  it("has listings available", () => {
    expect(MOCK_LISTINGS.length).toBeGreaterThan(0);
  });

  it("each listing has required fields", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing).toHaveProperty("id");
      expect(listing).toHaveProperty("title");
      expect(listing).toHaveProperty("slug");
      expect(listing).toHaveProperty("current_price");
      expect(listing).toHaveProperty("category");
      expect(listing).toHaveProperty("images");
      expect(listing.current_price).toBeGreaterThan(0);
      expect(listing.title).toBeTruthy();
      expect(listing.slug).toBeTruthy();
    });
  });

  it("each listing has at least one image", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing.images.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("slugs are URL-safe", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("prices are reasonable (R10 - R50,000)", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing.current_price).toBeGreaterThanOrEqual(10);
      expect(listing.current_price).toBeLessThanOrEqual(50000);
    });
  });

  it("original prices are higher than current prices when present", () => {
    MOCK_LISTINGS.forEach((listing) => {
      if (listing.original_price) {
        expect(listing.original_price).toBeGreaterThanOrEqual(listing.current_price);
      }
    });
  });

  it("ratings are 0-5", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing.rating_average).toBeGreaterThanOrEqual(0);
      expect(listing.rating_average).toBeLessThanOrEqual(5);
    });
  });

  it("review counts are non-negative", () => {
    MOCK_LISTINGS.forEach((listing) => {
      expect(listing.rating_count).toBeGreaterThanOrEqual(0);
    });
  });

  it("has unique IDs", () => {
    const ids = MOCK_LISTINGS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique slugs", () => {
    const slugs = MOCK_LISTINGS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("categories are valid", () => {
    const validCategories = [
      "Electronics",
      "Home & Kitchen",
      "Fashion",
      "Beauty & Health",
      "Sports & Outdoors",
      "Toys & Games",
      "Automotive",
      "Garden & DIY",
    ];
    MOCK_LISTINGS.forEach((listing) => {
      expect(validCategories).toContain(listing.category);
    });
  });
});

describe("Mock Deals", () => {
  it("has deals available", () => {
    expect(MOCK_DEALS.length).toBeGreaterThan(0);
  });

  it("each deal has required fields", () => {
    MOCK_DEALS.forEach((deal) => {
      expect(deal).toHaveProperty("id");
      expect(deal).toHaveProperty("listing_id");
      expect(deal).toHaveProperty("deal_price");
      expect(deal).toHaveProperty("original_price");
      expect(deal).toHaveProperty("quantity_available");
      expect(deal).toHaveProperty("quantity_sold");
      expect(deal).toHaveProperty("ends_at");
    });
  });

  it("deal prices are less than original prices", () => {
    MOCK_DEALS.forEach((deal) => {
      expect(deal.deal_price).toBeLessThan(deal.original_price);
    });
  });

  it("quantity sold does not exceed total", () => {
    MOCK_DEALS.forEach((deal) => {
      expect(deal.quantity_sold).toBeLessThanOrEqual(deal.quantity_available);
    });
  });

  it("deals have future end dates", () => {
    const now = new Date();
    MOCK_DEALS.forEach((deal) => {
      const endDate = new Date(deal.ends_at);
      expect(endDate.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});
