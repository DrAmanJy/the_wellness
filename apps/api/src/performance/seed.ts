import { db, products, productCategories, categories, eq } from '@wellness/db';
import { env } from '@wellness/config';

// 10,000 products, each with a random price and assigned to random categories
const NUM_PRODUCTS = 10000;
const BATCH_SIZE = 1000;

async function seed() {
  console.log(`Checking benchmark dataset for ${NUM_PRODUCTS} products...`);
  
  const existingProducts = await db.$count(products);
  if (existingProducts >= NUM_PRODUCTS) {
    console.log(`Database already has ${existingProducts} products. Skipping seed.`);
    return;
  }

  console.log(`Starting to seed ${NUM_PRODUCTS} products...`);

  // Create a base benchmark category
  let cat = (await db.select().from(categories).where(eq(categories.slug, 'benchmark-category')).limit(1))[0];
  if (!cat) {
    const [inserted] = await db
      .insert(categories)
      .values({
        name: 'Benchmark Category',
        slug: 'benchmark-category',
      })
      .returning();
    cat = inserted;
  }

  // Create or get a system user
  const { user } = await import('@wellness/db');
  let sysUser = (await db.select().from(user).where(eq(user.email, 'system@benchmark.local')).limit(1))[0];
  if (!sysUser) {
    const [insertedUser] = await db
      .insert(user)
      .values({
        id: crypto.randomUUID(), // Need ID for Better Auth user table
        name: 'System Benchmark',
        email: 'system@benchmark.local',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    sysUser = insertedUser;
  }

  for (let i = 0; i < NUM_PRODUCTS; i += BATCH_SIZE) {
    const batch = [];
    const size = Math.min(BATCH_SIZE, NUM_PRODUCTS - i);
    
    for (let j = 0; j < size; j++) {
      const idx = i + j;
      batch.push({
        name: `Benchmark Product ${idx}`,
        slug: `benchmark-product-${idx}-${Date.now()}`,
        description: `This is a benchmark product generated for performance testing. ID: ${idx}`,
        shortDescription: `Benchmark ${idx}`,
        brand: `Brand ${idx % 10}`,
        status: 'active' as const,
        isFeatured: idx % 100 === 0, // 1% featured
        createdBy: sysUser.id,
        updatedBy: sysUser.id,
      });
    }

    // Insert batch of products
    console.log(`Inserting products ${i} to ${i + size - 1}...`);
    const insertedProducts = await db.insert(products).values(batch).returning({ id: products.id });

    // Link all to the benchmark category
    const catLinks = insertedProducts.map(p => ({
      productId: p.id,
      categoryId: cat.id
    }));
    await db.insert(productCategories).values(catLinks);
  }

  console.log('Seeding completed.');
}

seed().then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
