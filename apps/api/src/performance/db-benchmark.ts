import { db, sql } from '@wellness/db';

async function runBenchmark() {
  console.log('Running Database Benchmarks...');

  const queries = [
    {
      name: 'Get Public Products (First Page, 20 items)',
      query: sql`EXPLAIN (ANALYZE, BUFFERS) 
        SELECT id, name, slug, "short_description", brand, "is_featured", "created_at" 
        FROM products 
        WHERE status = 'active' AND "deleted_at" IS NULL 
        ORDER BY "created_at" DESC 
        LIMIT 20`
    },
    {
      name: 'Get Featured Products (First Page, 20 items)',
      query: sql`EXPLAIN (ANALYZE, BUFFERS) 
        SELECT id, name, slug, "short_description", brand, "is_featured", "created_at" 
        FROM products 
        WHERE status = 'active' AND "deleted_at" IS NULL AND "is_featured" = true
        ORDER BY "created_at" DESC 
        LIMIT 20`
    },
    {
      name: 'Count Products by Category',
      query: sql`EXPLAIN (ANALYZE, BUFFERS)
        SELECT COUNT(*)
        FROM "product_categories" pc
        INNER JOIN "products" p ON p.id = pc."product_id"
        WHERE p.status = 'active' AND p."deleted_at" IS NULL AND pc."category_id" = (SELECT id FROM categories WHERE slug = 'benchmark-category' LIMIT 1)`
    }
  ];

  for (const q of queries) {
    console.log(`\n========================================`);
    console.log(`Query: ${q.name}`);
    console.log(`========================================`);
    const t0 = performance.now();
    const result = await db.execute(q.query);
    const t1 = performance.now();
    console.log(`Execution Time: ${String((t1 - t0).toFixed(2))} ms`);
    if (result.rows.length > 0 && result.rows[0] && 'QUERY PLAN' in (result.rows[0])) {
        result.rows.forEach((row: unknown) => { 
          const r = row as Record<string, unknown>;
          console.log(String(r['QUERY PLAN'])); 
        });
    } else {
        console.log(`Returned ${result.rows.length} rows`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Query: Fetch actual data`);
  console.log(`========================================`);
  const t2 = performance.now();
  await db.execute(sql`SELECT id, name, slug, "short_description", brand, "is_featured", "created_at" FROM products WHERE status = 'active' AND "deleted_at" IS NULL ORDER BY "created_at" DESC LIMIT 1`);
  const t3 = performance.now();
  console.log(`Actual fetch 1 row time: ${String((t3 - t2).toFixed(2))} ms`);
}

runBenchmark().then(() => {
  console.log('\nDB Benchmark complete.');
  process.exit(0);
}).catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
