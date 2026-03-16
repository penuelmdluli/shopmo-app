-- ============================================
-- ShopMO Storefront Tables
-- Run this in Supabase SQL Editor to add all
-- customer-facing tables to the shared SellBot DB
-- ============================================

-- 1. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  preferred_language VARCHAR(10) DEFAULT 'en',
  marketing_opt_in BOOLEAN DEFAULT false,
  whatsapp_opt_in BOOLEAN DEFAULT false,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 2. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  street_address TEXT NOT NULL,
  suburb VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'South Africa',
  is_default BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);

-- 3. CUSTOMER ORDERS
CREATE TABLE IF NOT EXISTS customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  vat_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(50) DEFAULT 'pending_payment',
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  shipping_method VARCHAR(100),
  shipping_provider VARCHAR(100),
  shipping_tracking_number VARCHAR(255),
  shipping_estimated_delivery TIMESTAMPTZ,
  shipping_address_id UUID REFERENCES customer_addresses(id),
  shipping_address_snapshot JSONB,
  pargo_pickup_point_code VARCHAR(100),
  notes TEXT,
  coupon_code VARCHAR(50),
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  guest_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
CREATE INDEX IF NOT EXISTS idx_customer_orders_number ON customer_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_customer_orders_payment_status ON customer_orders(payment_status);

-- 4. CUSTOMER ORDER ITEMS
CREATE TABLE IF NOT EXISTS customer_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
  listing_id UUID,
  product_id UUID,
  seller_order_id UUID,
  product_name VARCHAR(500) NOT NULL,
  product_image TEXT,
  sku VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_order_items_order ON customer_order_items(customer_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_items_listing ON customer_order_items(listing_id);

-- 5. STOREFRONT CATEGORIES
CREATE TABLE IF NOT EXISTS storefront_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  parent_id UUID REFERENCES storefront_categories(id),
  description TEXT,
  image_url TEXT,
  icon_name VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storefront_categories_slug ON storefront_categories(slug);
CREATE INDEX IF NOT EXISTS idx_storefront_categories_active ON storefront_categories(is_active);

-- 6. CUSTOMER REVIEWS
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  listing_id UUID NOT NULL,
  customer_order_id UUID REFERENCES customer_orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  body TEXT,
  images JSONB DEFAULT '[]',
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  seller_response TEXT,
  seller_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_listing ON customer_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer ON customer_reviews(customer_id);

-- 7. DEALS
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  deal_type VARCHAR(50) DEFAULT 'flash_sale',
  original_price DECIMAL(12,2) NOT NULL,
  deal_price DECIMAL(12,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_deals_listing ON deals(listing_id);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NOT NULL,
  min_order_amount DECIMAL(12,2) DEFAULT 0,
  max_discount_amount DECIMAL(12,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applicable_categories TEXT[],
  applicable_listing_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 9. COUPON USAGE
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  customer_id UUID REFERENCES customers(id),
  customer_order_id UUID REFERENCES customer_orders(id),
  discount_applied DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- 10. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_customer ON wishlist_items(customer_id);

-- 11. PRICE ALERTS
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL,
  target_price DECIMAL(12,2),
  alert_type VARCHAR(50) DEFAULT 'price_drop',
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CUSTOMER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  channel VARCHAR(50) DEFAULT 'in_app',
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customer_notifications_customer ON customer_notifications(customer_id);

-- 13. RECENTLY VIEWED
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  listing_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- 14. SEARCH QUERIES
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  session_id VARCHAR(255),
  query VARCHAR(500) NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_listing_id UUID,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (storefront browsing)
CREATE POLICY "Public read storefront_categories" ON storefront_categories FOR SELECT USING (true);
CREATE POLICY "Public read deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON customer_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- CUSTOMER-SCOPED policies (logged-in customers)
CREATE POLICY "Customers read own profile" ON customers FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers update own profile" ON customers FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers manage own addresses" ON customer_addresses FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Customers read own orders" ON customer_orders FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Customers read own order items" ON customer_order_items FOR SELECT USING (
  customer_order_id IN (
    SELECT id FROM customer_orders WHERE customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Customers manage own wishlist" ON wishlist_items FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Customers create reviews" ON customer_reviews FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Customers read own reviews" ON customer_reviews FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()) OR status = 'approved'
);

CREATE POLICY "Customers manage own alerts" ON price_alerts FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Customers read own notifications" ON customer_notifications FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Anyone can view recently_viewed" ON recently_viewed FOR ALL USING (true);
CREATE POLICY "Anyone can create search_queries" ON search_queries FOR ALL USING (true);

-- SERVICE ROLE INSERT policies (for API routes using service role key)
-- These allow the server to insert orders for guest checkouts
CREATE POLICY "Service insert customer_orders" ON customer_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert customer_order_items" ON customer_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update customer_orders" ON customer_orders FOR UPDATE USING (true);
CREATE POLICY "Service insert coupon_usage" ON coupon_usage FOR ALL USING (true);

-- ============================================
-- SEED DEFAULT COUPONS
-- ============================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until, is_active) VALUES
  ('WELCOME10', 'Welcome 10% off first order', 'percentage', 10, 200, 500, NULL, '2027-12-31', true),
  ('SHOPMO50', 'R50 off orders over R500', 'fixed_amount', 50, 500, NULL, NULL, '2027-12-31', true),
  ('FREESHIP', 'Free shipping on orders over R300', 'free_shipping', 0, 300, NULL, NULL, '2027-12-31', true),
  ('SHOPMO10', '10% off (customer service recovery)', 'percentage', 10, 0, 300, NULL, '2027-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SEED DEFAULT CATEGORIES
-- ============================================

INSERT INTO storefront_categories (name, slug, description, icon_name, display_order, is_active) VALUES
  ('Electronics', 'electronics', 'Smartphones, gadgets, tech accessories', 'Smartphone', 1, true),
  ('Home & Kitchen', 'home-kitchen', 'Appliances, cookware, home essentials', 'Home', 2, true),
  ('Fashion', 'fashion', 'Clothing, shoes, accessories', 'Shirt', 3, true),
  ('Beauty & Health', 'beauty-health', 'Skincare, haircare, wellness', 'Heart', 4, true),
  ('Sports & Outdoors', 'sports-outdoors', 'Fitness, camping, outdoor gear', 'Dumbbell', 5, true),
  ('Toys & Games', 'toys-games', 'Kids toys, board games, puzzles', 'Gamepad2', 6, true),
  ('Automotive', 'automotive', 'Car accessories, tools, parts', 'Car', 7, true),
  ('Garden & DIY', 'garden-diy', 'Garden tools, plants, DIY supplies', 'Flower2', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- UPDATE TRIGGER for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customer_orders_updated_at BEFORE UPDATE ON customer_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customer_reviews_updated_at BEFORE UPDATE ON customer_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
