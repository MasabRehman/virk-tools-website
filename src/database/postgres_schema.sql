-- ============================================================================
-- VIRK Tools & Equipment - Complete Database Schema
-- Version: 1.0.0
-- Engine: InnoDB | Charset: utf8mb4_unicode_ci
-- ============================================================================



-- ============================================================================
-- 1. USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) DEFAULT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "deleted_at" TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_users_email" UNIQUE ("email")
) ;

-- ============================================================================
-- 2. ADMINS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "admins" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(255) DEFAULT 'admin',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_admins_email" UNIQUE ("email")
) ;

-- ============================================================================
-- 3. CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "image_url" VARCHAR(500) DEFAULT NULL,
  "banner_url" VARCHAR(500) DEFAULT NULL,
  "description" TEXT DEFAULT NULL,
  "display_order" INT DEFAULT 0,
  "is_featured" BOOLEAN DEFAULT FALSE,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "deleted_at" TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_categories_slug" UNIQUE ("slug")
) ;

-- ============================================================================
-- 4. SUBCATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS "subcategories" (
  "id" SERIAL,
  "category_id" INT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "image_url" VARCHAR(500) DEFAULT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "deleted_at" TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_subcategories_slug" UNIQUE ("slug"),
  CONSTRAINT "fk_subcategories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 5. BRANDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "brands" (
  "id" SERIAL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "logo_url" VARCHAR(500) DEFAULT NULL,
  "description" TEXT DEFAULT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "deleted_at" TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_brands_slug" UNIQUE ("slug")
) ;

-- ============================================================================
-- 6. PRODUCTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL,
  "sku" VARCHAR(100) NOT NULL,
  "name" VARCHAR(500) NOT NULL,
  "slug" VARCHAR(500) NOT NULL,
  "brand_id" INT DEFAULT NULL,
  "category_id" INT DEFAULT NULL,
  "subcategory_id" INT DEFAULT NULL,
  "selling_price" DECIMAL(12,2) NOT NULL,
  "availability_status" VARCHAR(255) DEFAULT 'available',
  "description" TEXT DEFAULT NULL,
  "main_image_url" VARCHAR(500) DEFAULT NULL,
  "is_featured" BOOLEAN DEFAULT FALSE,
  "is_published" BOOLEAN DEFAULT FALSE,
  "is_disabled" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  "deleted_at" TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_products_sku" UNIQUE ("sku"),
  CONSTRAINT "uk_products_slug" UNIQUE ("slug"),
  CONSTRAINT "fk_products_brand" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_products_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_products_subcategory" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL
) ;

-- ============================================================================
-- 7. PRODUCT VARIANTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "variant_name" VARCHAR(255) NOT NULL,
  "sku_modifier" VARCHAR(50) DEFAULT NULL,
  "price_modifier" DECIMAL(12,2) DEFAULT 0.00,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_product_variants_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 8. PRODUCT SPECIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "product_specifications" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "spec_key" VARCHAR(255) NOT NULL,
  "spec_value" VARCHAR(500) NOT NULL,
  "display_order" INT DEFAULT 0,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_product_specifications_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 9. PRODUCT IMAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "image_url" VARCHAR(500) NOT NULL,
  "display_order" INT DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_product_images_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 10. PRODUCT TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "product_tags" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "tag_name" VARCHAR(100) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_product_tags_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 11. RELATED PRODUCTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "related_products" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "related_product_id" INT NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_related_products" UNIQUE ("product_id", "related_product_id"),
  CONSTRAINT "fk_related_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_related_products_related" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 12. CART
-- ============================================================================
CREATE TABLE IF NOT EXISTS "cart" (
  "id" SERIAL,
  "user_id" INT DEFAULT NULL,
  "session_token" VARCHAR(255) DEFAULT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_cart_session_token" UNIQUE ("session_token"),
  CONSTRAINT "fk_cart_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 13. CART ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" SERIAL,
  "cart_id" INT NOT NULL,
  "product_id" INT NOT NULL,
  "variant_id" INT DEFAULT NULL,
  "quantity" INT NOT NULL DEFAULT 1,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_cart_items" UNIQUE ("cart_id", "product_id", "variant_id"),
  CONSTRAINT "fk_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_cart_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
) ;

-- ============================================================================
-- 14. ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL,
  "order_number" VARCHAR(20) NOT NULL,
  "user_id" INT DEFAULT NULL,
  "customer_name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "alt_phone" VARCHAR(20) DEFAULT NULL,
  "email" VARCHAR(255) DEFAULT NULL,
  "complete_address" TEXT NOT NULL,
  "city" VARCHAR(100) NOT NULL,
  "location" VARCHAR(255) DEFAULT NULL,
  "delivery_notes" TEXT DEFAULT NULL,
  "subtotal_amount" DECIMAL(12,2) NOT NULL,
  "delivery_charge" DECIMAL(12,2) DEFAULT 0.00,
  "additional_charge" DECIMAL(12,2) DEFAULT 0.00,
  "grand_total" DECIMAL(12,2) NOT NULL,
  "confirmation_status" VARCHAR(255) DEFAULT 'pending_confirmation',
  "admin_notes" TEXT DEFAULT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_orders_order_number" UNIQUE ("order_number"),
  CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
) ;

-- ============================================================================
-- 15. ORDER ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL,
  "order_id" INT NOT NULL,
  "product_id" INT DEFAULT NULL,
  "variant_id" INT DEFAULT NULL,
  "product_name" VARCHAR(500) NOT NULL,
  "sku" VARCHAR(100) NOT NULL,
  "quantity" INT NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "total_price" DECIMAL(12,2) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_order_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
) ;

-- ============================================================================
-- 16. DELIVERY RULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS "delivery_rules" (
  "id" SERIAL,
  "city_or_location_name" VARCHAR(255) NOT NULL,
  "fee_amount" DECIMAL(12,2) NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")
) ;

-- ============================================================================
-- 17. COMPANY SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "company_settings" (
  "id" SERIAL,
  "setting_key" VARCHAR(100) NOT NULL,
  "setting_value" TEXT DEFAULT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "uk_company_settings_key" UNIQUE ("setting_key")
) ;

-- ============================================================================
-- 18. HOMEPAGE BANNERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "homepage_banners" (
  "id" SERIAL,
  "desktop_image_url" VARCHAR(500) DEFAULT NULL,
  "mobile_image_url" VARCHAR(500) DEFAULT NULL,
  "title" VARCHAR(255) DEFAULT NULL,
  "subtitle" TEXT DEFAULT NULL,
  "link_url" VARCHAR(500) DEFAULT NULL,
  "display_order" INT DEFAULT 0,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id")
) ;

-- ============================================================================
-- 19. CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "customers" (
  "id" SERIAL,
  "user_id" INT DEFAULT NULL,
  "full_name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "email" VARCHAR(255) DEFAULT NULL,
  "total_orders" INT DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_customers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
) ;

-- ============================================================================
-- 20. SUPPLIER INFORMATION (STRICTLY PRIVATE - ADMIN ONLY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "supplier_information" (
  "id" SERIAL,
  "product_id" INT NOT NULL,
  "supplier_name" VARCHAR(255) DEFAULT NULL,
  "supplier_contact" VARCHAR(100) DEFAULT NULL,
  "supplier_code" VARCHAR(100) DEFAULT NULL,
  "purchase_price" DECIMAL(12,2) DEFAULT NULL,
  "internal_notes" TEXT DEFAULT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_supplier_information_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 21. EXCEL EXPORT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS "excel_export_log" (
  "id" SERIAL,
  "order_id" INT NOT NULL,
  "exported_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "file_path" VARCHAR(500) DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'success',
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_excel_export_log_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
) ;

-- ============================================================================
-- 22. ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS "activity_log" (
  "id" SERIAL,
  "admin_id" INT DEFAULT NULL,
  "action_type" VARCHAR(100) NOT NULL,
  "description" TEXT DEFAULT NULL,
  "ip_address" VARCHAR(45) DEFAULT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_activity_log_admin" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL
) ;


-- Postgres Indexes
CREATE INDEX "idx_categories_is_active" ON "categories" ("is_active");
CREATE INDEX "idx_categories_is_featured" ON "categories" ("is_featured");
CREATE INDEX "idx_categories_slug" ON "categories" ("slug");
CREATE INDEX "idx_subcategories_category_id" ON "subcategories" ("category_id");
CREATE INDEX "idx_subcategories_slug" ON "subcategories" ("slug");
CREATE INDEX "idx_brands_slug" ON "brands" ("slug");
CREATE INDEX "idx_brands_is_active" ON "brands" ("is_active");
CREATE INDEX "idx_products_brand_id" ON "products" ("brand_id");
CREATE INDEX "idx_products_category_id" ON "products" ("category_id");
CREATE INDEX "idx_products_subcategory_id" ON "products" ("subcategory_id");
CREATE INDEX "idx_products_name" ON "products" ("name");
CREATE INDEX "idx_products_is_featured" ON "products" ("is_featured");
CREATE INDEX "idx_products_is_published" ON "products" ("is_published");
CREATE INDEX "idx_products_availability_status" ON "products" ("availability_status");
CREATE INDEX "idx_product_variants_product_id" ON "product_variants" ("product_id");
CREATE INDEX "idx_product_specifications_product_id" ON "product_specifications" ("product_id");
CREATE INDEX "idx_product_images_product_id" ON "product_images" ("product_id");
CREATE INDEX "idx_product_tags_product_id" ON "product_tags" ("product_id");
CREATE INDEX "idx_product_tags_tag_name" ON "product_tags" ("tag_name");
CREATE INDEX "idx_related_products_product_id" ON "related_products" ("product_id");
CREATE INDEX "idx_related_products_related_id" ON "related_products" ("related_product_id");
CREATE INDEX "idx_cart_user_id" ON "cart" ("user_id");
CREATE INDEX "idx_cart_session_token" ON "cart" ("session_token");
CREATE INDEX "idx_cart_items_cart_id" ON "cart_items" ("cart_id");
CREATE INDEX "idx_cart_items_product_id" ON "cart_items" ("product_id");
CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX "idx_orders_phone" ON "orders" ("phone");
CREATE INDEX "idx_orders_city" ON "orders" ("city");
CREATE INDEX "idx_orders_confirmation_status" ON "orders" ("confirmation_status");
CREATE INDEX "idx_orders_created_at" ON "orders" ("created_at");
CREATE INDEX "idx_order_items_order_id" ON "order_items" ("order_id");
CREATE INDEX "idx_order_items_product_id" ON "order_items" ("product_id");
CREATE INDEX "idx_delivery_rules_city" ON "delivery_rules" ("city_or_location_name");
CREATE INDEX "idx_homepage_banners_is_active" ON "homepage_banners" ("is_active");
CREATE INDEX "idx_homepage_banners_display_order" ON "homepage_banners" ("display_order");
CREATE INDEX "idx_customers_phone" ON "customers" ("phone");
CREATE INDEX "idx_customers_email" ON "customers" ("email");
CREATE INDEX "idx_supplier_information_product_id" ON "supplier_information" ("product_id");
CREATE INDEX "idx_excel_export_log_order_id" ON "excel_export_log" ("order_id");
CREATE INDEX "idx_activity_log_admin_id" ON "activity_log" ("admin_id");
CREATE INDEX "idx_activity_log_action_type" ON "activity_log" ("action_type");
CREATE INDEX "idx_activity_log_created_at" ON "activity_log" ("created_at");