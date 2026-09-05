CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forward, in-place migration converting serial integer IDs to UUIDs
-- Preserves existing data, stable ID mappings, and foreign key relationships without truncation

-- 1. Drop existing foreign keys referencing integer ids
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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category' AND column_name = 'id' AND data_type IN ('integer', 'smallint', 'bigint')
  ) THEN
    -- 2. Add temporary new_id UUID columns with defaults to all tables
    ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "shipping_address" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "cart" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "cart_item" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "order_shipping_address" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "order_item" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "payment" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "refund" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "inventory" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
    ALTER TABLE "inventory_transaction" ADD COLUMN IF NOT EXISTS "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;

    -- 3. Add temporary UUID foreign key columns
    ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "new_category_id" uuid;
    ALTER TABLE "cart_item" ADD COLUMN IF NOT EXISTS "new_cart_id" uuid;
    ALTER TABLE "cart_item" ADD COLUMN IF NOT EXISTS "new_product_id" uuid;
    ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "new_shipping_address" uuid;
    ALTER TABLE "order_shipping_address" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "order_item" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "order_item" ADD COLUMN IF NOT EXISTS "new_product_id" uuid;
    ALTER TABLE "order_status_history" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "payment" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "new_payment_id" uuid;
    ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "refund" ADD COLUMN IF NOT EXISTS "new_payment_id" uuid;
    ALTER TABLE "refund" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;
    ALTER TABLE "inventory" ADD COLUMN IF NOT EXISTS "new_product_id" uuid;
    ALTER TABLE "inventory_transaction" ADD COLUMN IF NOT EXISTS "new_product_id" uuid;
    ALTER TABLE "inventory_transaction" ADD COLUMN IF NOT EXISTS "new_order_id" uuid;

    -- 4. Backfill foreign key relationships using existing integer IDs
    UPDATE "product" p SET "new_category_id" = c."new_id" FROM "category" c WHERE p."category_id" = c."id";
    UPDATE "cart_item" ci SET "new_cart_id" = c."new_id" FROM "cart" c WHERE ci."cart_id" = c."id";
    UPDATE "cart_item" ci SET "new_product_id" = p."new_id" FROM "product" p WHERE ci."product_id" = p."id";
    UPDATE "order" o SET "new_shipping_address" = s."new_id" FROM "shipping_address" s WHERE o."shipping_address" = s."id";
    UPDATE "order_shipping_address" osa SET "new_order_id" = o."new_id" FROM "order" o WHERE osa."order_id" = o."id";
    UPDATE "order_item" oi SET "new_order_id" = o."new_id" FROM "order" o WHERE oi."order_id" = o."id";
    UPDATE "order_item" oi SET "new_product_id" = p."new_id" FROM "product" p WHERE oi."product_id" = p."id";
    UPDATE "order_status_history" osh SET "new_order_id" = o."new_id" FROM "order" o WHERE osh."order_id" = o."id";
    UPDATE "payment" pm SET "new_order_id" = o."new_id" FROM "order" o WHERE pm."order_id" = o."id";
    UPDATE "invoice" inv SET "new_payment_id" = pm."new_id" FROM "payment" pm WHERE inv."payment_id" = pm."id";
    UPDATE "invoice" inv SET "new_order_id" = o."new_id" FROM "order" o WHERE inv."order_id" = o."id";
    UPDATE "refund" rf SET "new_payment_id" = pm."new_id" FROM "payment" pm WHERE rf."payment_id" = pm."id";
    UPDATE "refund" rf SET "new_order_id" = o."new_id" FROM "order" o WHERE rf."order_id" = o."id";
    UPDATE "inventory" inv SET "new_product_id" = p."new_id" FROM "product" p WHERE inv."product_id" = p."id";
    UPDATE "inventory_transaction" it SET "new_product_id" = p."new_id" FROM "product" p WHERE it."product_id" = p."id";
    UPDATE "inventory_transaction" it SET "new_order_id" = o."new_id" FROM "order" o WHERE it."order_id" = o."id";

    -- 5. Drop primary key constraints on old integer ids
    ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "category_pkey" CASCADE;
    ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_pkey" CASCADE;
    ALTER TABLE "shipping_address" DROP CONSTRAINT IF EXISTS "shipping_address_pkey" CASCADE;
    ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_pkey" CASCADE;
    ALTER TABLE "cart_item" DROP CONSTRAINT IF EXISTS "cart_item_pkey" CASCADE;
    ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "order_pkey" CASCADE;
    ALTER TABLE "order_shipping_address" DROP CONSTRAINT IF EXISTS "order_shipping_address_pkey" CASCADE;
    ALTER TABLE "order_item" DROP CONSTRAINT IF EXISTS "order_item_pkey" CASCADE;
    ALTER TABLE "order_status_history" DROP CONSTRAINT IF EXISTS "order_status_history_pkey" CASCADE;
    ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "payment_pkey" CASCADE;
    ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "invoice_pkey" CASCADE;
    ALTER TABLE "refund" DROP CONSTRAINT IF EXISTS "refund_pkey" CASCADE;
    ALTER TABLE "inventory" DROP CONSTRAINT IF EXISTS "inventory_pkey" CASCADE;
    ALTER TABLE "inventory_transaction" DROP CONSTRAINT IF EXISTS "inventory_transaction_pkey" CASCADE;

    -- 6. Swap integer columns with UUID columns
    ALTER TABLE "category" DROP COLUMN "id";
    ALTER TABLE "category" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "category" ADD PRIMARY KEY ("id");

    ALTER TABLE "product" DROP COLUMN "id";
    ALTER TABLE "product" DROP COLUMN "category_id";
    ALTER TABLE "product" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "product" RENAME COLUMN "new_category_id" TO "category_id";
    ALTER TABLE "product" ADD PRIMARY KEY ("id");

    ALTER TABLE "shipping_address" DROP COLUMN "id";
    ALTER TABLE "shipping_address" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "shipping_address" ADD PRIMARY KEY ("id");

    ALTER TABLE "cart" DROP COLUMN "id";
    ALTER TABLE "cart" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "cart" ADD PRIMARY KEY ("id");

    ALTER TABLE "cart_item" DROP COLUMN "id";
    ALTER TABLE "cart_item" DROP COLUMN "cart_id";
    ALTER TABLE "cart_item" DROP COLUMN "product_id";
    ALTER TABLE "cart_item" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "cart_item" RENAME COLUMN "new_cart_id" TO "cart_id";
    ALTER TABLE "cart_item" RENAME COLUMN "new_product_id" TO "product_id";
    ALTER TABLE "cart_item" ALTER COLUMN "cart_id" SET NOT NULL;
    ALTER TABLE "cart_item" ALTER COLUMN "product_id" SET NOT NULL;
    ALTER TABLE "cart_item" ADD PRIMARY KEY ("id");

    ALTER TABLE "order" DROP COLUMN "id";
    ALTER TABLE "order" DROP COLUMN "shipping_address";
    ALTER TABLE "order" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "order" RENAME COLUMN "new_shipping_address" TO "shipping_address";
    ALTER TABLE "order" ADD PRIMARY KEY ("id");

    ALTER TABLE "order_shipping_address" DROP COLUMN "id";
    ALTER TABLE "order_shipping_address" DROP COLUMN "order_id";
    ALTER TABLE "order_shipping_address" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "order_shipping_address" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "order_shipping_address" ALTER COLUMN "order_id" SET NOT NULL;
    ALTER TABLE "order_shipping_address" ADD PRIMARY KEY ("id");

    ALTER TABLE "order_item" DROP COLUMN "id";
    ALTER TABLE "order_item" DROP COLUMN "order_id";
    ALTER TABLE "order_item" DROP COLUMN "product_id";
    ALTER TABLE "order_item" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "order_item" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "order_item" RENAME COLUMN "new_product_id" TO "product_id";
    ALTER TABLE "order_item" ALTER COLUMN "order_id" SET NOT NULL;
    ALTER TABLE "order_item" ALTER COLUMN "product_id" SET NOT NULL;
    ALTER TABLE "order_item" ADD PRIMARY KEY ("id");

    ALTER TABLE "order_status_history" DROP COLUMN "id";
    ALTER TABLE "order_status_history" DROP COLUMN "order_id";
    ALTER TABLE "order_status_history" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "order_status_history" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "order_status_history" ALTER COLUMN "order_id" SET NOT NULL;
    ALTER TABLE "order_status_history" ADD PRIMARY KEY ("id");

    ALTER TABLE "payment" DROP COLUMN "id";
    ALTER TABLE "payment" DROP COLUMN "order_id";
    ALTER TABLE "payment" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "payment" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "payment" ALTER COLUMN "order_id" SET NOT NULL;
    ALTER TABLE "payment" ADD PRIMARY KEY ("id");

    ALTER TABLE "invoice" DROP COLUMN "id";
    ALTER TABLE "invoice" DROP COLUMN "payment_id";
    ALTER TABLE "invoice" DROP COLUMN "order_id";
    ALTER TABLE "invoice" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "invoice" RENAME COLUMN "new_payment_id" TO "payment_id";
    ALTER TABLE "invoice" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "invoice" ADD PRIMARY KEY ("id");

    ALTER TABLE "refund" DROP COLUMN "id";
    ALTER TABLE "refund" DROP COLUMN "payment_id";
    ALTER TABLE "refund" DROP COLUMN "order_id";
    ALTER TABLE "refund" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "refund" RENAME COLUMN "new_payment_id" TO "payment_id";
    ALTER TABLE "refund" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "refund" ADD PRIMARY KEY ("id");

    ALTER TABLE "inventory" DROP COLUMN "id";
    ALTER TABLE "inventory" DROP COLUMN "product_id";
    ALTER TABLE "inventory" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "inventory" RENAME COLUMN "new_product_id" TO "product_id";
    ALTER TABLE "inventory" ALTER COLUMN "product_id" SET NOT NULL;
    ALTER TABLE "inventory" ADD PRIMARY KEY ("id");
    ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_unique" UNIQUE ("product_id");

    ALTER TABLE "inventory_transaction" DROP COLUMN "id";
    ALTER TABLE "inventory_transaction" DROP COLUMN "product_id";
    ALTER TABLE "inventory_transaction" DROP COLUMN "order_id";
    ALTER TABLE "inventory_transaction" RENAME COLUMN "new_id" TO "id";
    ALTER TABLE "inventory_transaction" RENAME COLUMN "new_product_id" TO "product_id";
    ALTER TABLE "inventory_transaction" RENAME COLUMN "new_order_id" TO "order_id";
    ALTER TABLE "inventory_transaction" ALTER COLUMN "product_id" SET NOT NULL;
    ALTER TABLE "inventory_transaction" ADD PRIMARY KEY ("id");
  END IF;
END $$;

-- 7. Re-add foreign keys
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
