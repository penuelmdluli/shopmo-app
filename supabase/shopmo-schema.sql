-- ============================================
-- ShopMO Storefront Schema Extension
-- Extends existing SellBot tables (users, products, suppliers, listings, orders, etc.)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  preferred_language TEXT NOT NULL DEFAULT 'en',
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_auth_user_id_unique UNIQUE (auth_user_id),
  CONSTRAINT customers_email_unique UNIQUE (email)
);

CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_customers_email ON customers(email);

-- ============================================
-- 2. CUSTOMER_ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  suburb TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'South Africa',
  is_default BOOLEAN NOT NULL DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- ============================================
-- 3. CARTS
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'merged', 'converted')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);

-- ============================================
-- 4. CART_ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100),
  unit_price NUMERIC(10,2) NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_items_cart_listing_unique UNIQUE (cart_id, listing_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_listing_id ON cart_items(listing_id);

-- ============================================
-- 5. CUSTOMER_ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS customer_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'paid', 'processing', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled', 'refunded'
  )),
  payment_method TEXT,
  payment_provider TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  shipping_method TEXT,
  shipping_provider TEXT,
  shipping_tracking_number TEXT,
  shipping_estimated_delivery TIMESTAMPTZ,
  shipping_address_id UUID REFERENCES customer_addresses(id) ON DELETE SET NULL,
  shipping_address_snapshot JSONB,
  pargo_pickup_point_code TEXT,
  notes TEXT,
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customer_orders_order_number_unique UNIQUE (order_number)
);

CREATE INDEX idx_customer_orders_customer_id ON customer_orders(customer_id);
CREATE INDEX idx_customer_orders_order_number ON customer_orders(order_number);
CREATE INDEX idx_customer_orders_status ON customer_orders(status);
CREATE INDEX idx_customer_orders_payment_status ON customer_orders(payment_status);
CREATE INDEX idx_customer_orders_created_at ON customer_orders(created_at DESC);

-- ============================================
-- 6. CUSTOMER_ORDER_ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS customer_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  seller_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_order_items_order_id ON customer_order_items(customer_order_id);
CREATE INDEX idx_customer_order_items_listing_id ON customer_order_items(listing_id);

-- ============================================
-- 7. WISHLISTS
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wishlists_customer_listing_unique UNIQUE (customer_id, listing_id)
);

CREATE INDEX idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX idx_wishlists_listing_id ON wishlists(listing_id);

-- ============================================
-- 8. CUSTOMER_REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  customer_order_id UUID REFERENCES customer_orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  seller_response TEXT,
  seller_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_reviews_customer_id ON customer_reviews(customer_id);
CREATE INDEX idx_customer_reviews_listing_id ON customer_reviews(listing_id);
CREATE INDEX idx_customer_reviews_rating ON customer_reviews(rating);
CREATE INDEX idx_customer_reviews_status ON customer_reviews(status);

-- ============================================
-- 9. PRODUCT_QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES customers(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_questions_listing_id ON product_questions(listing_id);
CREATE INDEX idx_product_questions_customer_id ON product_questions(customer_id);
CREATE INDEX idx_product_questions_status ON product_questions(status);

-- ============================================
-- 10. COUPONS
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_customer_limit INTEGER NOT NULL DEFAULT 1,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_categories TEXT[],
  applicable_listing_ids UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coupons_code_unique UNIQUE (code)
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- ============================================
-- 11. COUPON_USAGE
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_order_id UUID REFERENCES customer_orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_customer_id ON coupon_usage(customer_id);

-- ============================================
-- 12. DEALS
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('flash_sale', 'daily_deal', 'clearance')),
  original_price NUMERIC(10,2) NOT NULL,
  deal_price NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(5,2),
  quantity_available INTEGER,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_listing_id ON deals(listing_id);
CREATE INDEX idx_deals_is_active ON deals(is_active);
CREATE INDEX idx_deals_deal_type ON deals(deal_type);
CREATE INDEX idx_deals_ends_at ON deals(ends_at);

-- ============================================
-- 13. PRICE_ALERTS
-- ============================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  target_price NUMERIC(10,2),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'back_in_stock')),
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT price_alerts_customer_listing_type_unique UNIQUE (customer_id, listing_id, alert_type)
);

CREATE INDEX idx_price_alerts_customer_id ON price_alerts(customer_id);
CREATE INDEX idx_price_alerts_listing_id ON price_alerts(listing_id);

-- ============================================
-- 14. CUSTOMER_NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'whatsapp', 'push')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_customer_notifications_customer_id ON customer_notifications(customer_id);
CREATE INDEX idx_customer_notifications_is_read ON customer_notifications(is_read);
CREATE INDEX idx_customer_notifications_sent_at ON customer_notifications(sent_at DESC);

-- ============================================
-- 15. RECENTLY_VIEWED
-- ============================================
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recently_viewed_customer_listing_unique UNIQUE (customer_id, listing_id)
);

CREATE INDEX idx_recently_viewed_customer_id ON recently_viewed(customer_id);
CREATE INDEX idx_recently_viewed_viewed_at ON recently_viewed(viewed_at DESC);

-- ============================================
-- 16. SEARCH_QUERIES
-- ============================================
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  clicked_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_queries_customer_id ON search_queries(customer_id);
CREATE INDEX idx_search_queries_query ON search_queries(query);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at DESC);

-- ============================================
-- 17. STOREFRONT_CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS storefront_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES storefront_categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  icon_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT storefront_categories_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_storefront_categories_slug ON storefront_categories(slug);
CREATE INDEX idx_storefront_categories_parent_id ON storefront_categories(parent_id);
CREATE INDEX idx_storefront_categories_is_active ON storefront_categories(is_active);
CREATE INDEX idx_storefront_categories_display_order ON storefront_categories(display_order);

-- ============================================
-- AUTO-CREATE CUSTOMER PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (auth_user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_carts_updated_at
  BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customer_orders_updated_at
  BEFORE UPDATE ON customer_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_categories ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS: users can read/update their own profile
CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- CUSTOMER_ADDRESSES: users manage their own addresses
CREATE POLICY "addresses_select_own" ON customer_addresses
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "addresses_insert_own" ON customer_addresses
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "addresses_update_own" ON customer_addresses
  FOR UPDATE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "addresses_delete_own" ON customer_addresses
  FOR DELETE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- CARTS: users manage their own carts, anon can use session_id
CREATE POLICY "carts_select_own" ON carts
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR (customer_id IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "carts_insert" ON carts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "carts_update_own" ON carts
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR (customer_id IS NULL AND session_id IS NOT NULL)
  );

-- CART_ITEMS: accessible through cart ownership
CREATE POLICY "cart_items_select" ON cart_items
  FOR SELECT USING (
    cart_id IN (
      SELECT id FROM carts WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
      OR (customer_id IS NULL AND session_id IS NOT NULL)
    )
  );

CREATE POLICY "cart_items_insert" ON cart_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "cart_items_update" ON cart_items
  FOR UPDATE USING (true);

CREATE POLICY "cart_items_delete" ON cart_items
  FOR DELETE USING (true);

-- CUSTOMER_ORDERS: users see their own orders
CREATE POLICY "orders_select_own" ON customer_orders
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "orders_insert_own" ON customer_orders
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- CUSTOMER_ORDER_ITEMS: accessible through order ownership
CREATE POLICY "order_items_select" ON customer_order_items
  FOR SELECT USING (
    customer_order_id IN (
      SELECT id FROM customer_orders WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    )
  );

-- WISHLISTS: users manage their own
CREATE POLICY "wishlists_select_own" ON wishlists
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "wishlists_insert_own" ON wishlists
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "wishlists_delete_own" ON wishlists
  FOR DELETE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- CUSTOMER_REVIEWS: public read for approved, users manage own
CREATE POLICY "reviews_select_approved" ON customer_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "reviews_insert_own" ON customer_reviews
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "reviews_update_own" ON customer_reviews
  FOR UPDATE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- PRODUCT_QUESTIONS: public read for answered, users can ask
CREATE POLICY "questions_select_public" ON product_questions
  FOR SELECT USING (status IN ('pending', 'answered'));

CREATE POLICY "questions_insert_own" ON product_questions
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- COUPONS: public read for active coupons
CREATE POLICY "coupons_select_active" ON coupons
  FOR SELECT USING (is_active = true);

-- COUPON_USAGE: users see their own
CREATE POLICY "coupon_usage_select_own" ON coupon_usage
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "coupon_usage_insert_own" ON coupon_usage
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- DEALS: public read for active deals
CREATE POLICY "deals_select_active" ON deals
  FOR SELECT USING (is_active = true AND ends_at > NOW());

-- PRICE_ALERTS: users manage their own
CREATE POLICY "price_alerts_select_own" ON price_alerts
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "price_alerts_insert_own" ON price_alerts
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "price_alerts_delete_own" ON price_alerts
  FOR DELETE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- CUSTOMER_NOTIFICATIONS: users see their own
CREATE POLICY "notifications_select_own" ON customer_notifications
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "notifications_update_own" ON customer_notifications
  FOR UPDATE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- RECENTLY_VIEWED: users manage their own
CREATE POLICY "recently_viewed_select_own" ON recently_viewed
  FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "recently_viewed_insert_own" ON recently_viewed
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "recently_viewed_delete_own" ON recently_viewed
  FOR DELETE USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- SEARCH_QUERIES: insert allowed for all (tracking), select own
CREATE POLICY "search_queries_insert" ON search_queries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "search_queries_select_own" ON search_queries
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR customer_id IS NULL
  );

-- STOREFRONT_CATEGORIES: public read for active categories
CREATE POLICY "categories_select_active" ON storefront_categories
  FOR SELECT USING (is_active = true);
