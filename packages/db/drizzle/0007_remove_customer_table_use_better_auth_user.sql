ALTER TABLE "shipping_address" DROP CONSTRAINT IF EXISTS "shipping_address_customer_id_customer_id_fk";
ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_customer_id_customer_id_fk";
ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "order_customer_id_customer_id_fk";

ALTER TABLE "shipping_address" DROP COLUMN IF EXISTS "customer_id";
ALTER TABLE "cart" DROP COLUMN IF EXISTS "customer_id";
ALTER TABLE "order" DROP COLUMN IF EXISTS "customer_id";

ALTER TABLE "shipping_address" ADD COLUMN IF NOT EXISTS "user_id" text REFERENCES "user"("id");
ALTER TABLE "cart" ADD COLUMN IF NOT EXISTS "user_id" text REFERENCES "user"("id");
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "user_id" text REFERENCES "user"("id");

DROP TABLE IF EXISTS "customer" CASCADE;
DROP TYPE IF EXISTS "customer_method" CASCADE;
