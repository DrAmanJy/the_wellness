DO $$ BEGIN
 CREATE TYPE "public"."customer_method" AS ENUM('local', 'google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'out_of_stock', 'discontinued');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'reservation', 'release', 'return', 'adjustment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."refund_status" AS ENUM('initiated', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DROP TABLE IF EXISTS "cart_item" CASCADE;
DROP TABLE IF EXISTS "cart" CASCADE;
DROP TABLE IF EXISTS "inventory_transaction" CASCADE;
DROP TABLE IF EXISTS "inventory" CASCADE;
DROP TABLE IF EXISTS "refund" CASCADE;
DROP TABLE IF EXISTS "invoice" CASCADE;
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "order_status_history" CASCADE;
DROP TABLE IF EXISTS "order_item" CASCADE;
DROP TABLE IF EXISTS "order_shipping_address" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS "product" CASCADE;
DROP TABLE IF EXISTS "category" CASCADE;
DROP TABLE IF EXISTS "shipping_address" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "product_images" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "product_categories" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;

CREATE TABLE IF NOT EXISTS "customer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"method" "customer_method",
	"token_hash" text,
	"phone_number" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "shipping_address" (
	"id" serial PRIMARY KEY NOT NULL,
	"house_number" varchar(255),
	"street" text,
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(20),
	"country" varchar(100),
	"customer_id" integer REFERENCES "customer"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"ingrediants" jsonb,
	"tags" jsonb,
	"selling_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"mrp" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"stock_status" "stock_status" DEFAULT 'in_stock' NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_newest" boolean DEFAULT false NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"category_id" integer REFERENCES "category"("id"),
	"features" jsonb
);

CREATE TABLE IF NOT EXISTS "cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer REFERENCES "customer"("id"),
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL REFERENCES "cart"("id") ON DELETE cascade,
	"product_id" integer NOT NULL REFERENCES "product"("id"),
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "unique_cart_product_idx" ON "cart_item" ("cart_id", "product_id");

CREATE TABLE IF NOT EXISTS "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL UNIQUE REFERENCES "product"("id"),
	"available_qty" integer DEFAULT 0 NOT NULL,
	"reserved_qty" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL REFERENCES "product"("id"),
	"order_id" integer,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "order" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer REFERENCES "customer"("id"),
	"shipping_address" integer REFERENCES "shipping_address"("id"),
	"delivery_provider" varchar(255),
	"price" integer,
	"expected_delivery_date" timestamp with time zone,
	"tracking_number" varchar(255),
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" integer,
	"discount_amount" integer,
	"shipping_amount" integer,
	"tax_amount" integer,
	"total_amount" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_shipping_address" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL REFERENCES "order"("id") ON DELETE cascade,
	"house_number" varchar(255),
	"street" text,
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(20),
	"country" varchar(100)
);

CREATE TABLE IF NOT EXISTS "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL REFERENCES "order"("id") ON DELETE cascade,
	"product_id" integer NOT NULL REFERENCES "product"("id"),
	"product_name" varchar(255),
	"product_sku" varchar(100),
	"unit_price" integer,
	"quantity" integer NOT NULL,
	"discount_amount" integer,
	"tax_amount" integer,
	"total_amount" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL REFERENCES "order"("id") ON DELETE cascade,
	"status" varchar(100),
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL REFERENCES "order"("id"),
	"transaction_id" varchar(255),
	"provider" varchar(100),
	"amount" integer,
	"currency" varchar(10),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer REFERENCES "payment"("id"),
	"order_id" integer REFERENCES "order"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "refund" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer REFERENCES "payment"("id"),
	"order_id" integer REFERENCES "order"("id"),
	"amount" integer,
	"reason" text,
	"status" "refund_status" DEFAULT 'initiated' NOT NULL,
	"transaction_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
