// ============================================
// ShopMO Customer-Facing Types
// ============================================

export interface Customer {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  preferred_language: string;
  marketing_opt_in: boolean;
  whatsapp_opt_in: boolean;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  suburb: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Cart {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  status: "active" | "merged" | "converted";
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  listing_id: string;
  quantity: number;
  unit_price: number;
  added_at: string;
  listing?: StorefrontListing;
}

export interface StorefrontListing {
  id: string;
  product_id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  images: string[];
  current_price: number;
  original_price: number | null;
  sku: string;
  stock_quantity: number;
  is_in_stock: boolean;
  rating_average: number;
  rating_count: number;
  tags: string[];
  attributes: Record<string, string>;
  brand: string | null;
  status: "live" | "paused" | "draft";
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  customer_id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  vat_amount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_method: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  paid_at: string | null;
  shipping_method: string | null;
  shipping_provider: string | null;
  shipping_tracking_number: string | null;
  shipping_estimated_delivery: string | null;
  shipping_address_id: string | null;
  shipping_address_snapshot: CustomerAddress | null;
  pargo_pickup_point_code: string | null;
  notes: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  items?: CustomerOrderItem[];
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface CustomerOrderItem {
  id: string;
  customer_order_id: string;
  listing_id: string | null;
  seller_order_id: string | null;
  product_name: string;
  product_image: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  listing_id: string;
  created_at: string;
  listing?: StorefrontListing;
}

export interface CustomerReview {
  id: string;
  customer_id: string;
  listing_id: string;
  customer_order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  status: "pending" | "approved" | "rejected";
  seller_response: string | null;
  seller_responded_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: { full_name: string; avatar_url: string | null };
}

export interface ProductQuestion {
  id: string;
  listing_id: string;
  customer_id: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
  helpful_count: number;
  status: string;
  created_at: string;
  customer?: { full_name: string };
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_customer_limit: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_categories: string[] | null;
  applicable_listing_ids: string[] | null;
  created_at: string;
}

export interface Deal {
  id: string;
  listing_id: string;
  deal_type: "flash_sale" | "daily_deal" | "clearance";
  original_price: number;
  deal_price: number;
  discount_percentage: number | null;
  quantity_available: number | null;
  quantity_sold: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  listing?: StorefrontListing;
}

export interface PriceAlert {
  id: string;
  customer_id: string;
  listing_id: string;
  target_price: number | null;
  alert_type: "price_drop" | "back_in_stock";
  is_triggered: boolean;
  triggered_at: string | null;
  notification_sent: boolean;
  created_at: string;
}

export interface CustomerNotification {
  id: string;
  customer_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  channel: string;
  sent_at: string;
  read_at: string | null;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  children?: StorefrontCategory[];
}

export interface ShippingRate {
  provider: string;
  service_name: string;
  price: number;
  estimated_days: number;
  estimated_delivery: string;
  tracking_available: boolean;
  pickup_point?: {
    code: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

export interface SearchQuery {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  query: string;
  results_count: number;
  clicked_listing_id: string | null;
  converted: boolean;
  created_at: string;
}
