import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackSearch,
  trackAddToWishlist,
  trackLead,
  trackCompleteRegistration,
} from "@/lib/facebook-pixel";

describe("Facebook Pixel Tracking", () => {
  let mockFbq: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFbq = vi.fn();
    window.fbq = mockFbq;
  });

  describe("trackPageView", () => {
    it("calls fbq with PageView event", () => {
      trackPageView();
      expect(mockFbq).toHaveBeenCalledWith("track", "PageView");
    });
  });

  describe("trackViewContent", () => {
    it("calls fbq with ViewContent and params", () => {
      trackViewContent({
        content_name: "Test Product",
        content_ids: ["123"],
        content_type: "product",
        value: 299,
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", {
        content_name: "Test Product",
        content_ids: ["123"],
        content_type: "product",
        value: 299,
        currency: "ZAR",
      });
    });

    it("uses custom currency when provided", () => {
      trackViewContent({
        content_name: "Test",
        content_ids: ["1"],
        content_type: "product",
        value: 100,
        currency: "USD",
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", expect.objectContaining({
        currency: "USD",
      }));
    });
  });

  describe("trackAddToCart", () => {
    it("calls fbq with AddToCart and ZAR currency", () => {
      trackAddToCart({
        content_name: "Cool Gadget",
        content_ids: ["456"],
        content_type: "product",
        value: 599,
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "AddToCart", expect.objectContaining({
        content_name: "Cool Gadget",
        value: 599,
        currency: "ZAR",
      }));
    });
  });

  describe("trackInitiateCheckout", () => {
    it("calls fbq with InitiateCheckout", () => {
      trackInitiateCheckout({
        content_ids: ["1", "2"],
        num_items: 3,
        value: 1500,
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "InitiateCheckout", expect.objectContaining({
        num_items: 3,
        value: 1500,
        currency: "ZAR",
      }));
    });
  });

  describe("trackPurchase", () => {
    it("calls fbq with Purchase", () => {
      trackPurchase({
        content_ids: ["1"],
        content_type: "product",
        num_items: 1,
        value: 999,
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "Purchase", expect.objectContaining({
        value: 999,
        currency: "ZAR",
      }));
    });
  });

  describe("trackSearch", () => {
    it("calls fbq with Search and search string", () => {
      trackSearch("wireless charger");
      expect(mockFbq).toHaveBeenCalledWith("track", "Search", {
        search_string: "wireless charger",
      });
    });
  });

  describe("trackAddToWishlist", () => {
    it("calls fbq with AddToWishlist", () => {
      trackAddToWishlist({
        content_name: "Dream Product",
        content_ids: ["789"],
        value: 350,
      });
      expect(mockFbq).toHaveBeenCalledWith("track", "AddToWishlist", expect.objectContaining({
        content_name: "Dream Product",
        currency: "ZAR",
      }));
    });
  });

  describe("trackLead", () => {
    it("calls fbq with Lead event", () => {
      trackLead();
      expect(mockFbq).toHaveBeenCalledWith("track", "Lead");
    });
  });

  describe("trackCompleteRegistration", () => {
    it("calls fbq with CompleteRegistration event", () => {
      trackCompleteRegistration();
      expect(mockFbq).toHaveBeenCalledWith("track", "CompleteRegistration");
    });
  });

  describe("graceful handling when fbq not available", () => {
    it("does not throw when fbq is undefined", () => {
      // @ts-expect-error - intentionally testing undefined
      window.fbq = undefined;
      expect(() => trackPageView()).not.toThrow();
      expect(() => trackSearch("test")).not.toThrow();
      expect(() => trackAddToCart({
        content_name: "x",
        content_ids: ["1"],
        content_type: "product",
        value: 10,
      })).not.toThrow();
    });
  });
});
