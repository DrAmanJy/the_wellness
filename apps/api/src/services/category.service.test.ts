import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { db, productCategories } from '@wellness/db';
import { ConflictError, NotFoundError } from '@wellness/utils';

import { categoryService } from './category.service';
import { factories } from '../test/factories';

describe('CategoryService', () => {
  let adminId: string;

  beforeEach(async () => {
    // Seed test user
    const user = await factories.createUser();
    adminId = user.id;
  });

  afterEach(async () => {
    // Deterministic cleanup
    await factories.cleanup();
  });

  describe('Create Category', () => {
    it('creates a valid category', async () => {
      const data = { name: 'Health', slug: 'health' };
      const category = await categoryService.createCategory(data, adminId);

      expect(category).toBeDefined();
      expect(category.name).toBe('Health');
      expect(category.slug).toBe('health');
      expect(category.createdBy).toBe(adminId);
      expect(category.isActive).toBe(true);
    });

    it('rejects concurrent duplicate slug creations', async () => {
      const duplicateSlug = 'concurrent-slug';
      const data = { name: 'Test', slug: duplicateSlug };

      // Fire 5 requests simultaneously
      const promises = Array.from({ length: 5 }).map(() =>
        categoryService.createCategory(data, adminId),
      );

      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Due to Postgres UNIQUE index, exactly 1 should succeed
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(4);
    });

    it('rejects invalid or non-existent parent', async () => {
      // It fails either from app validation or DB foreign key
      await expect(
        categoryService.createCategory(
          {
            name: 'Child',
            slug: 'child',
            parentId: '00000000-0000-0000-0000-000000000000',
          },
          adminId,
        ),
      ).rejects.toThrow();
    });
  });

  describe('Update Category & Hierarchy constraints', () => {
    it('updates category successfully', async () => {
      const cat = await factories.createCategory({ name: 'Old Name' });
      const updated = await categoryService.updateCategory(cat.id, { name: 'New Name' }, adminId);
      expect(updated.name).toBe('New Name');
    });

    it('throws NotFoundError for updating non-existent category', async () => {
      await expect(
        categoryService.updateCategory(
          '00000000-0000-0000-0000-000000000000',
          { name: 'Any' },
          adminId,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for updating soft-deleted category', async () => {
      const cat = await factories.createCategory();
      await categoryService.deleteCategory(cat.id);
      await expect(
        categoryService.updateCategory(cat.id, { name: 'Any' }, adminId),
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects self-parenting', async () => {
      const cat = await factories.createCategory();

      await expect(
        categoryService.updateCategory(cat.id, { parentId: cat.id }, adminId),
      ).rejects.toThrow(ConflictError);
    });

    it('detects and rejects deep hierarchy cycles (A -> B -> C -> A)', async () => {
      const catA = await factories.createCategory({ name: 'A', slug: 'a' });
      const catB = await factories.createCategory({ name: 'B', slug: 'b', parentId: catA.id });
      const catC = await factories.createCategory({ name: 'C', slug: 'c', parentId: catB.id });

      // Attempt to make A a child of C (Cycle)
      await expect(
        categoryService.updateCategory(catA.id, { parentId: catC.id }, adminId),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Read Categories', () => {
    it('hides inactive and deleted categories from public listing', async () => {
      await factories.createCategory({ name: 'Active', slug: 'active', isActive: true });
      await factories.createCategory({ name: 'Inactive', slug: 'inactive', isActive: false });

      const deletedCat = await factories.createCategory({ name: 'Deleted', slug: 'deleted' });
      await categoryService.deleteCategory(deletedCat.id); // Soft delete

      const results = await categoryService.getPublicCategories();

      expect(results.length).toBe(1);
      expect(results[0]?.slug).toBe('active');
    });

    it('gets category by slug successfully', async () => {
      await factories.createCategory({ name: 'Found Me', slug: 'found-me' });
      const cat = await categoryService.getCategoryBySlug('found-me');
      expect(cat).toBeDefined();
      expect(cat.name).toBe('Found Me');
    });

    it('throws NotFoundError for non-existent slug in getCategoryBySlug', async () => {
      await expect(categoryService.getCategoryBySlug('does-not-exist')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws NotFoundError when getting inactive category by slug', async () => {
      await factories.createCategory({ name: 'Inactive', slug: 'inactive', isActive: false });
      await expect(categoryService.getCategoryBySlug('inactive')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError when getting soft-deleted category by slug', async () => {
      const deletedCat = await factories.createCategory({ name: 'Deleted', slug: 'deleted' });
      await categoryService.deleteCategory(deletedCat.id);

      await expect(categoryService.getCategoryBySlug('deleted')).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete Category', () => {
    it('blocks deletion if category has active children', async () => {
      const parent = await factories.createCategory({ name: 'Parent', slug: 'parent' });
      await factories.createCategory({ name: 'Child', slug: 'child', parentId: parent.id });

      await expect(categoryService.deleteCategory(parent.id)).rejects.toThrow(ConflictError);
    });

    it('allows deletion if category has ONLY soft-deleted children', async () => {
      const parent = await factories.createCategory({ name: 'Parent', slug: 'parent' });
      const child = await factories.createCategory({
        name: 'Child',
        slug: 'child',
        parentId: parent.id,
      });
      await categoryService.deleteCategory(child.id);

      const deletedParent = await categoryService.deleteCategory(parent.id);
      expect(deletedParent.deletedAt).toBeInstanceOf(Date);
    });

    it('blocks deletion if category is linked to products', async () => {
      const cat = await factories.createCategory();
      const product = await factories.createProduct();

      // Link product and category
      await db.insert(productCategories).values({
        productId: product.id,
        categoryId: cat.id,
      });

      await expect(categoryService.deleteCategory(cat.id)).rejects.toThrow(ConflictError);
    });

    it('successfully soft-deletes empty category', async () => {
      const cat = await factories.createCategory();
      const deleted = await categoryService.deleteCategory(cat.id);

      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundError for deleting non-existent category', async () => {
      await expect(
        categoryService.deleteCategory('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError for repeated deletion of soft-deleted category', async () => {
      const cat = await factories.createCategory();
      await categoryService.deleteCategory(cat.id);

      await expect(categoryService.deleteCategory(cat.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Slug constraints', () => {
    it('allows slug reuse after soft-deletion', async () => {
      const cat1 = await factories.createCategory({ name: 'Test', slug: 'test' });
      await categoryService.deleteCategory(cat1.id);

      const cat2 = await categoryService.createCategory(
        {
          name: 'Test',
          slug: 'test',
          description: '',
          imageUrl: '',
          isActive: true,
          sortOrder: 0,
          metadata: {},
        },
        adminId,
      );

      expect(cat2.id).not.toBe(cat1.id);
      expect(cat2.slug).toBe('test');
    });
  });
});
