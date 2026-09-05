CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop foreign keys referencing integer ids
ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_category_id_category_id_fk";
ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_category_id_category_fk";
ALTER TABLE "cart_item" DROP CONSTRAINT IF EXISTS "cart_item_cart_id_cart_id_fk";
ALTER TABLE "cart_item" DROP CONSTRAINT IF EXISTS "cart_item_product_id_product_id_fk";
ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "order_shipping_address_shipping_address_id_fk";
ALTER TABLE "order_shipping_address" DROP CONSTRAINT IF EXISTS "order_shipping_address_order_id_order_id_fk";
ALTER TABLE "order_item" DROP CONSTRAINT IF EXISTS "order_item_order_id_order_id_fk";
ALTER TABLE "order_item" DROP CONSTRAINT IF EXISTS "order_item_product_id_product_id_fk";
ALTER TABLE "order_status_history" DROP CONSTRAINT IF EXISTS "order_status_history_order_id_order_id_fk";
ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "payment_order_id_order_id_fk";
ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "invoice_payment_id_payment_id_fk";
ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "invoice_order_id_order_id_fk";
ALTER TABLE "refund" DROP CONSTRAINT IF EXISTS "refund_payment_id_payment_id_fk";
ALTER TABLE "refund" DROP CONSTRAINT IF EXISTS "refund_order_id_order_id_fk";
ALTER TABLE "inventory" DROP CONSTRAINT IF EXISTS "inventory_product_id_product_id_fk";
ALTER TABLE "inventory_transaction" DROP CONSTRAINT IF EXISTS "inventory_transaction_product_id_product_id_fk";

-- Truncate tables for clean UUID migration
TRUNCATE TABLE "refund", "invoice", "payment", "order_status_history", "order_item", "order_shipping_address", "order", "inventory_transaction", "inventory", "cart_item", "cart", "shipping_address", "product", "category" CASCADE;

-- Drop default serial nextval sequences
ALTER TABLE "category" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "product" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "shipping_address" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "cart" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "cart_item" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "order" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "order_shipping_address" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "order_item" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "order_status_history" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "payment" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "invoice" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "refund" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "inventory" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "inventory_transaction" ALTER COLUMN "id" DROP DEFAULT;

-- Change id and fk types to uuid
ALTER TABLE "category" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "product" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "product" ALTER COLUMN "category_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "shipping_address" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "cart" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "cart_item" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "cart_item" ALTER COLUMN "cart_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "cart_item" ALTER COLUMN "product_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "order" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "order" ALTER COLUMN "shipping_address" SET DATA TYPE uuid USING NULL;

ALTER TABLE "order_shipping_address" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "order_shipping_address" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "order_item" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "order_item" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "order_item" ALTER COLUMN "product_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "order_status_history" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "order_status_history" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "payment" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "payment" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "invoice" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "invoice" ALTER COLUMN "payment_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "invoice" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "refund" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "refund" ALTER COLUMN "payment_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "refund" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "inventory" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "inventory" ALTER COLUMN "product_id" SET DATA TYPE uuid USING NULL;

ALTER TABLE "inventory_transaction" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid(), ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "inventory_transaction" ALTER COLUMN "product_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "inventory_transaction" ALTER COLUMN "order_id" SET DATA TYPE uuid USING NULL;

-- Re-add foreign keys
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "category"("id");
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE;
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id");
ALTER TABLE "order" ADD CONSTRAINT "order_shipping_address_shipping_address_id_fk" FOREIGN KEY ("shipping_address") REFERENCES "shipping_address"("id");
ALTER TABLE "order_shipping_address" ADD CONSTRAINT "order_shipping_address_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id");
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id");
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payment"("id");
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id");
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payment"("id");
ALTER TABLE "refund" ADD CONSTRAINT "refund_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id");
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id");
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id");
