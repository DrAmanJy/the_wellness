import { describe, it, expect } from 'vitest';

import { NotFoundError } from '@wellness/utils';

import { categoryService } from '../../src/services/category.service';

describe('CategoryService', () => {
  describe('Create Category', () => {
    it('creates a valid category', async () => {
      const data = { name: 'Health', slug: 'health-cat' };
      const category = await categoryService.createCategory(data);

      expect(category).toBeDefined();
      expect(category.name).toBe('Health');
      expect(category.slug).toBe('health-cat');
      expect(category.isActive).toBe(true);
    });
  });

  describe('Read Categories', () => {
    it('gets public categories', async () => {
      const results = await categoryService.getPublicCategories();
      expect(Array.isArray(results)).toBe(true);
    });

    it('throws NotFoundError for non-existent slug', async () => {
      await expect(categoryService.getCategoryBySlug('non-existent-slug-xyz')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
