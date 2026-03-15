// Facebook Pixel tracking events for e-commerce
// These fire standard FB events for ad optimization and retargeting

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export function trackPageView() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

export function trackViewContent(params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      ...params,
      currency: params.currency || "ZAR",
    });
  }
}

export function trackAddToCart(params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      ...params,
      currency: params.currency || "ZAR",
    });
  }
}

export function trackInitiateCheckout(params: {
  content_ids: string[];
  num_items: number;
  value: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      ...params,
      currency: params.currency || "ZAR",
    });
  }
}

export function trackPurchase(params: {
  content_ids: string[];
  content_type: string;
  num_items: number;
  value: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      ...params,
      currency: params.currency || "ZAR",
    });
  }
}

export function trackSearch(searchString: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Search", { search_string: searchString });
  }
}

export function trackAddToWishlist(params: {
  content_name: string;
  content_ids: string[];
  value: number;
  currency?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToWishlist", {
      ...params,
      currency: params.currency || "ZAR",
    });
  }
}

export function trackLead() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead");
  }
}

export function trackCompleteRegistration() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "CompleteRegistration");
  }
}
