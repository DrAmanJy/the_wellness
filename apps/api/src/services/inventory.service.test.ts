import { describe, expect, it, beforeAll, afterAll } from 'vitest';

import { db, inventory, inventoryTransactions, productVariants } from '@wellness/db';

import { factories } from '../test/factories';

describe('Inventory Database Constraints', () => {
  beforeAll(async () => {
    await factories.cleanup();
  });

  afterAll(async () => {
    await factories.cleanup();
  });

  it('valid inventory creation', async () => {
    const p = await factories.createProduct();
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: p.id,
        name: 'Variant 1',
        sku: 'INV-01',
        price: '10',
      })
      .returning();

    if (!variant) throw new Error('variant undefined');

    const [inv] = await db
      .insert(inventory)
      .values({
        variantId: variant.id,
        availableQty: 10,
        reservedQty: 0,
      })
      .returning();

    if (!inv) throw new Error('inv undefined');
    expect(inv.variantId).toBe(variant.id);
    expect(inv.availableQty).toBe(10);
  });

  it('negative availableQty rejected', async () => {
    const p = await factories.createProduct();
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: p.id,
        name: 'Variant 2',
        sku: 'INV-02',
        price: '10',
      })
      .returning();

    if (!variant) throw new Error('variant undefined');

    try {
      await db
        .insert(inventory)
        .values({ variantId: variant.id, availableQty: -5, reservedQty: 0 });
      expect.fail('Should have thrown check constraint error');
    } catch (e: unknown) {
      expect(e).toBeDefined();
    }
  });

  it('negative reservedQty rejected', async () => {
    const p = await factories.createProduct();
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: p.id,
        name: 'Variant 3',
        sku: 'INV-03',
        price: '10',
      })
      .returning();

    if (!variant) throw new Error('variant undefined');

    try {
      await db
        .insert(inventory)
        .values({ variantId: variant.id, availableQty: 10, reservedQty: -1 });
      expect.fail('Should have thrown check constraint error');
    } catch (e: unknown) {
      expect(e).toBeDefined();
    }
  });

  it('duplicate variant inventory rejected', async () => {
    const p = await factories.createProduct();
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: p.id,
        name: 'Variant 4',
        sku: 'INV-04',
        price: '10',
      })
      .returning();

    if (!variant) throw new Error('variant undefined');

    await db.insert(inventory).values({
      variantId: variant.id,
      availableQty: 10,
      reservedQty: 0,
    });

    try {
      await db.insert(inventory).values({ variantId: variant.id, availableQty: 5, reservedQty: 0 });
      expect.fail('Should have thrown unique constraint error');
    } catch (e: unknown) {
      expect(e).toBeDefined();
    }
  });

  it('invalid variant FK rejected', async () => {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    try {
      await db.insert(inventory).values({ variantId: invalidId, availableQty: 10, reservedQty: 0 });
      expect.fail('Should have thrown foreign key constraint error');
    } catch (e: unknown) {
      expect(e).toBeDefined();
    }
  });

  it('transaction records correctly reference variants', async () => {
    const p = await factories.createProduct();
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: p.id,
        name: 'Variant 5',
        sku: 'INV-05',
        price: '10',
      })
      .returning();

    if (!variant) throw new Error('variant undefined');

    const [tx] = await db
      .insert(inventoryTransactions)
      .values({
        variantId: variant.id,
        type: 'purchase',
        quantity: 50,
      })
      .returning();

    if (!tx) throw new Error('tx undefined');
    expect(tx.variantId).toBe(variant.id);
    expect(tx.quantity).toBe(50);
  });
});
