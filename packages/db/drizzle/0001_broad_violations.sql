CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "categories_parent_not_self" CHECK ("categories"."parent_id" != "categories"."id")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"url" text NOT NULL,
	"alt_text" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_images_sort_order_positive" CHECK ("product_images"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"weight" numeric(10, 2),
	"length" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variants_price_positive" CHECK ("product_variants"."price" >= 0),
	CONSTRAINT "product_variants_compare_at_price_positive" CHECK ("product_variants"."compare_at_price" >= 0),
	CONSTRAINT "product_variants_compare_at_price_valid" CHECK ("product_variants"."compare_at_price" IS NULL OR "product_variants"."compare_at_price" >= "product_variants"."price"),
	CONSTRAINT "product_variants_weight_positive" CHECK ("product_variants"."weight" >= 0),
	CONSTRAINT "product_variants_length_positive" CHECK ("product_variants"."length" >= 0),
	CONSTRAINT "product_variants_width_positive" CHECK ("product_variants"."width" >= 0),
	CONSTRAINT "product_variants_height_positive" CHECK ("product_variants"."height" >= 0),
	CONSTRAINT "product_variants_sort_order_positive" CHECK ("product_variants"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"short_description" varchar(500),
	"brand" varchar(255),
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"category_primary_id" uuid,
	"tags" jsonb,
	"attributes" jsonb,
	"specifications" jsonb,
	"ingredients" jsonb,
	"benefits" jsonb,
	"seo" jsonb,
	"metadata" jsonb,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_primary_id_categories_id_fk" FOREIGN KEY ("category_primary_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique_idx" ON "categories" USING btree ("slug") WHERE "categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "categories_tree_idx" ON "categories" USING btree ("parent_id","is_active","sort_order");--> statement-breakpoint
CREATE INDEX "product_categories_category_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE INDEX "product_images_variant_idx" ON "product_images" USING btree ("variant_id","sort_order");--> statement-breakpoint
CREATE INDEX "product_variants_idx" ON "product_variants" USING btree ("product_id","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique_idx" ON "products" USING btree ("slug") WHERE "products"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "products_catalog_pagination_idx" ON "products" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "products_featured_catalog_idx" ON "products" USING btree ("status","is_featured","created_at");--> statement-breakpoint
CREATE INDEX "products_category_primary_idx" ON "products" USING btree ("category_primary_id","status");