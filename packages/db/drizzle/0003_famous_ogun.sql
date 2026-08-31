CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'reservation', 'release', 'return', 'adjustment');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"available_qty" integer DEFAULT 0 NOT NULL,
	"reserved_qty" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_available_qty_positive" CHECK ("inventory"."available_qty" >= 0),
	CONSTRAINT "inventory_reserved_qty_positive" CHECK ("inventory"."reserved_qty" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"order_id" uuid,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_transactions_quantity_positive" CHECK ("inventory_transactions"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_sku_unique";--> statement-breakpoint
DROP INDEX "product_images_primary_unique_idx";--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_transactions_order_id_idx" ON "inventory_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "inventory_transactions_variant_id_idx" ON "inventory_transactions" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_variant_unique_idx" ON "inventory" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "categories_name_trgm_idx" ON "categories" USING gin (("name"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "categories_slug_trgm_idx" ON "categories" USING gin (("slug"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "categories_description_trgm_idx" ON "categories" USING gin (("description"::text) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_variant_primary_unique_idx" ON "product_images" USING btree ("variant_id") WHERE "product_images"."is_primary" = true AND "product_images"."variant_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_unique_idx" ON "product_variants" USING btree ("sku") WHERE "product_variants"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "product_variants_sku_trgm_idx" ON "product_variants" USING gin (("sku"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_name_trgm_idx" ON "products" USING gin (("name"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_slug_trgm_idx" ON "products" USING gin (("slug"::text) gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_description_trgm_idx" ON "products" USING gin (("description"::text) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_primary_unique_idx" ON "product_images" USING btree ("product_id") WHERE "product_images"."is_primary" = true AND "product_images"."variant_id" IS NULL;