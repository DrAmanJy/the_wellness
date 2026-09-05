import { db, products, categories } from '@wellness/db';

async function seed() {
  console.log('Checking benchmark dataset...');

  const catInserted = await db
    .insert(categories)
    .values({
      name: 'Benchmark Category',
      slug: `benchmark-cat-${String(Date.now())}`,
    })
    .returning();

  const categoryId = catInserted[0]?.id;

  await db.insert(products).values([
    {
      name: 'Benchmark Product 1',
      description: 'Product 1 description',
      sellingPrice: '100.00',
      mrp: '150.00',
      stockQty: 50,
      categoryId,
    },
    {
      name: 'Benchmark Product 2',
      description: 'Product 2 description',
      sellingPrice: '200.00',
      mrp: '250.00',
      stockQty: 25,
      categoryId,
    },
  ]);

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
