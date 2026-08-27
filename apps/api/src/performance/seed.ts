import {
  db,
  products,
  productCategories,
  categories,
  productVariants,
  productImages,
  eq,
  and,
  isNull,
  sql,
} from '@wellness/db';

const NUM_CATS = 100;
const NUM_PRODUCTS = 10000;
const NUM_VARIANTS_PER_PRODUCT = 2; // 20k variants
const NUM_IMAGES_PER_PRODUCT = 3; // 30k images
const BATCH_SIZE = 1000;

async function seed() {
  console.log('Checking benchmark dataset...');

  // Categories
  console.log(`Seeding up to 100 categories...`);
  const existingCats = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.slug, 'benchmark-cat-0'), isNull(categories.deletedAt)));
  let catIds: string[];
  if (existingCats.length === 0) {
    const catsToInsert = [];
    for (let i = 0; i < NUM_CATS; i++) {
      catsToInsert.push({
        name: `Benchmark Category ${String(i)}`,
        slug: `benchmark-cat-${String(i)}`,
      });
    }
    const inserted = await db
      .insert(categories)
      .values(catsToInsert)
      .returning({ id: categories.id });
    catIds = inserted.map((c) => c.id);
  } else {
    console.log('Benchmark categories already exist.');
    const allCats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`slug LIKE 'benchmark-cat-%' AND deleted_at IS NULL`);
    catIds = allCats.map((c) => c.id);
  }

  if (catIds.length === 0) throw new Error('No categories available');

  // Count products
  const benchmarkProductCount = await db.$count(
    products,
    sql`slug LIKE 'benchmark-product-%' AND deleted_at IS NULL`,
  );

  if (benchmarkProductCount >= NUM_PRODUCTS) {
    console.log(`Benchmark already has ${String(benchmarkProductCount)} products. Skipping seed.`);
    return;
  }

  // System user
  const { user } = await import('@wellness/db');
  let sysUser = (
    await db.select().from(user).where(eq(user.email, 'system@benchmark.local')).limit(1)
  )[0];
  if (!sysUser) {
    const [insertedUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        name: 'System Benchmark',
        email: 'system@benchmark.local',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    sysUser = insertedUser;
  }

  console.log(
    `Starting to seed remaining products. Current: ${String(benchmarkProductCount)} / 10000`,
  );

  for (let i = benchmarkProductCount; i < NUM_PRODUCTS; i += BATCH_SIZE) {
    const batch = [];
    const size = Math.min(BATCH_SIZE, NUM_PRODUCTS - i);

    for (let j = 0; j < size; j++) {
      const idx = i + j;
      batch.push({
        name: `Benchmark Product ${String(idx)}`,
        slug: `benchmark-product-${String(idx)}-${String(Date.now())}`,
        description: `This is a benchmark product generated for performance testing. ID: ${String(idx)}`,
        shortDescription: `Benchmark ${String(idx)}`,
        brand: `Brand ${String(idx % 10)}`,
        status: 'active' as const,
        isFeatured: idx % 100 === 0,
        createdBy: sysUser ? sysUser.id : '',
        updatedBy: sysUser ? sysUser.id : '',
      });
    }

    console.log(`Inserting products ${String(i)} to ${String(i + size - 1)}...`);
    const insertedProducts = await db.insert(products).values(batch).returning({ id: products.id });

    const catLinks = [];
    const variants = [];
    const images = [];

    for (let k = 0; k < insertedProducts.length; k++) {
      const p = insertedProducts[k];
      const pIdx = i + k;

      // 2 Categories per product
      catLinks.push({ productId: p ? p.id : '', categoryId: catIds[pIdx % catIds.length] || '' });
      catLinks.push({
        productId: p ? p.id : '',
        categoryId: catIds[(pIdx + 1) % catIds.length] || '',
      });

      // 2 Variants per product
      for (let v = 0; v < NUM_VARIANTS_PER_PRODUCT; v++) {
        variants.push({
          productId: p ? p.id : '',
          name: `Variant ${String(v)}`,
          sku: `BENCH-${String(pIdx)}-${String(v)}`,
          price: (10 + (pIdx % 100) + v).toString(),
        });
      }

      // 3 Images per product
      for (let img = 0; img < NUM_IMAGES_PER_PRODUCT; img++) {
        images.push({
          productId: p ? p.id : '',
          url: `https://example.com/bench-${String(pIdx)}-${String(img)}.jpg`,
          isPrimary: img === 0,
          sortOrder: img,
        });
      }
    }

    await db.insert(productCategories).values(catLinks);
    await db.insert(productVariants).values(variants);
    await db.insert(productImages).values(images);
  }

  console.log('Seeding completed.');
}

seed()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
