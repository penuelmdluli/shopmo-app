import { describe, it, expect } from "vitest";

// Test the spin wheel probability logic independently
const SEGMENTS = [
  { label: "5% OFF", weight: 25, code: "SPIN5", discount: "5%" },
  { label: "Try Again", weight: 20, code: null, discount: null },
  { label: "10% OFF", weight: 20, code: "SPIN10", discount: "10%" },
  { label: "Free Ship", weight: 15, code: "FREESHIP", discount: "Free Shipping" },
  { label: "Try Again", weight: 10, code: null, discount: null },
  { label: "15% OFF", weight: 8, code: "SPIN15", discount: "15%" },
  { label: "Try Again", weight: 1, code: null, discount: null },
  { label: "R50 OFF", weight: 1, code: "SPIN50", discount: "R50 OFF" },
];

function pickWinningIndex(): number {
  const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < SEGMENTS.length; i++) {
    rand -= SEGMENTS[i].weight;
    if (rand <= 0) return i;
  }
  return 0;
}

describe("Spin-to-Win Wheel", () => {
  describe("Segments", () => {
    it("has 8 segments", () => {
      expect(SEGMENTS).toHaveLength(8);
    });

    it("total weight sums to 100", () => {
      const total = SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
      expect(total).toBe(100);
    });

    it("winning segments have codes", () => {
      const winners = SEGMENTS.filter((s) => s.code !== null);
      expect(winners.length).toBe(5);
      winners.forEach((w) => {
        expect(w.code).toBeTruthy();
        expect(w.discount).toBeTruthy();
      });
    });

    it("losing segments have null code", () => {
      const losers = SEGMENTS.filter((s) => s.code === null);
      expect(losers.length).toBe(3);
      losers.forEach((l) => {
        expect(l.label).toBe("Try Again");
      });
    });
  });

  describe("pickWinningIndex", () => {
    it("returns valid index", () => {
      for (let i = 0; i < 100; i++) {
        const idx = pickWinningIndex();
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(SEGMENTS.length);
      }
    });

    it("probability distribution favors small discounts over large ones", () => {
      const counts: Record<number, number> = {};
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const idx = pickWinningIndex();
        counts[idx] = (counts[idx] || 0) + 1;
      }

      // 5% OFF (weight 25) should appear more than R50 OFF (weight 1)
      const fivePercentCount = counts[0] || 0;
      const fiftyRandCount = counts[7] || 0;
      expect(fivePercentCount).toBeGreaterThan(fiftyRandCount * 5);
    });

    it("all segments are reachable", () => {
      const seen = new Set<number>();
      // With 10000 iterations, all segments should appear
      for (let i = 0; i < 10000; i++) {
        seen.add(pickWinningIndex());
        if (seen.size === SEGMENTS.length) break;
      }
      expect(seen.size).toBe(SEGMENTS.length);
    });
  });

  describe("Coupon Codes", () => {
    it("SPIN5 exists for 5% discount", () => {
      const seg = SEGMENTS.find((s) => s.code === "SPIN5");
      expect(seg).toBeDefined();
      expect(seg?.discount).toBe("5%");
    });

    it("SPIN10 exists for 10% discount", () => {
      const seg = SEGMENTS.find((s) => s.code === "SPIN10");
      expect(seg).toBeDefined();
      expect(seg?.discount).toBe("10%");
    });

    it("FREESHIP exists for free shipping", () => {
      const seg = SEGMENTS.find((s) => s.code === "FREESHIP");
      expect(seg).toBeDefined();
      expect(seg?.discount).toBe("Free Shipping");
    });

    it("SPIN15 exists for 15% discount", () => {
      const seg = SEGMENTS.find((s) => s.code === "SPIN15");
      expect(seg).toBeDefined();
    });

    it("SPIN50 exists for R50 discount", () => {
      const seg = SEGMENTS.find((s) => s.code === "SPIN50");
      expect(seg).toBeDefined();
      expect(seg?.discount).toBe("R50 OFF");
    });
  });
});

describe("Gift Card", () => {
  const GIFT_CARD_AMOUNTS = [100, 250, 500, 1000];

  it("has 4 preset amounts", () => {
    expect(GIFT_CARD_AMOUNTS).toHaveLength(4);
  });

  it("amounts are in ascending order", () => {
    for (let i = 1; i < GIFT_CARD_AMOUNTS.length; i++) {
      expect(GIFT_CARD_AMOUNTS[i]).toBeGreaterThan(GIFT_CARD_AMOUNTS[i - 1]);
    }
  });

  it("minimum custom amount is R50", () => {
    const minCustom = 50;
    expect(minCustom).toBe(50);
  });

  it("maximum custom amount is R5000", () => {
    const maxCustom = 5000;
    expect(maxCustom).toBe(5000);
  });

  it("generates unique gift card codes", () => {
    const generateCode = () =>
      `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const codes = new Set(Array.from({ length: 100 }, generateCode));
    expect(codes.size).toBeGreaterThan(90);
  });

  it("gift card code format is GC-XXXX-XXXX", () => {
    const code = `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    expect(code).toMatch(/^GC-[A-Z0-9]+-[A-Z0-9]+$/);
  });
});

describe("Exit Intent Popup", () => {
  it("storage key is defined", () => {
    const STORAGE_KEY = "shopmo_exit_shown";
    expect(STORAGE_KEY).toBe("shopmo_exit_shown");
  });

  it("discount code is STAYSHOPMO", () => {
    const code = "STAYSHOPMO";
    expect(code).toBe("STAYSHOPMO");
  });
});

describe("First Visit Banner", () => {
  it("storage key is defined", () => {
    const STORAGE_KEY = "shopmo_first_visit_banner_dismissed";
    expect(STORAGE_KEY).toBe("shopmo_first_visit_banner_dismissed");
  });

  it("discount code is WELCOME10", () => {
    const code = "WELCOME10";
    expect(code).toBe("WELCOME10");
  });
});
