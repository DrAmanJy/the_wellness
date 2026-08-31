import { db, categories, productCategories, eq, isNull, and, asc, sql } from '@wellness/db';
import { NotFoundError, ConflictError } from '@wellness/utils';

import { toCategoryListDTO, toCategoryDetailDTO, toCategoryMutationDTO } from './category.mapper';

const MAX_CATEGORY_DEPTH = 50;

export class CategoryService {
  async getPublicCategories() {
    const results = await db
      .select()
      .from(categories)
      .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
      .orderBy(asc(categories.sortOrder));

    return results.map(toCategoryListDTO);
  }

  async getCategoryBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(eq(categories.slug, slug), eq(categories.isActive, true), isNull(categories.deletedAt)),
      )
      .limit(1);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return toCategoryDetailDTO(category);
  }
  async createCategory(data: typeof categories.$inferInsert, userId: string) {
    if (data.parentId) {
      await this.validateParentId(data.parentId);
    }
    const [category] = await db
      .insert(categories)
      .values({
        ...data,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    if (!category) throw new Error('Failed to create category');
    return toCategoryMutationDTO(category);
  }

  async updateCategory(id: string, data: Partial<typeof categories.$inferInsert>, userId: string) {
    if (data.parentId) {
      if (data.parentId === id) throw new ConflictError('Category cannot parent itself');
      await this.validateParentId(data.parentId, id);
    }
    const [category] = await db
      .update(categories)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();

    if (!category) throw new NotFoundError('Category not found');
    return toCategoryMutationDTO(category);
  }

  async deleteCategory(id: string) {
    // Check if it has children
    const children = await db
      .select()
      .from(categories)
      .where(and(eq(categories.parentId, id), isNull(categories.deletedAt)))
      .limit(1);
    if (children.length > 0) throw new ConflictError('Cannot delete category with active children');

    // Check if it has products
    const productLinks = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.categoryId, id))
      .limit(1);
    if (productLinks.length > 0)
      throw new ConflictError('Cannot delete category assigned to products');

    const [category] = await db
      .update(categories)
      .set({
        deletedAt: new Date(),
      })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();

    if (!category) throw new NotFoundError('Category not found');
    return toCategoryMutationDTO(category);
  }

  private async validateParentId(parentId: string, currentId?: string) {
    // Validate initial parent exists and is not deleted
    const [initialParent] = await db
      .select({ id: categories.id, deletedAt: categories.deletedAt })
      .from(categories)
      .where(eq(categories.id, parentId));

    if (!initialParent) {
      throw new ConflictError('Parent category does not exist');
    }
    if (initialParent.deletedAt !== null) {
      throw new ConflictError('Parent category is deleted');
    }

    // Cycle detection via bounded recursive CTE — single query instead of per-ancestor loop
    if (currentId) {
      const ancestors = await db.execute<{ ancestor_id: string; depth: number }>(sql`
        WITH RECURSIVE ancestors AS (
          SELECT ${categories.parentId} AS ancestor_id, 1 AS depth
          FROM ${categories}
          WHERE ${categories.id} = ${parentId}
            AND ${categories.parentId} IS NOT NULL
          UNION ALL
          SELECT c.parent_id AS ancestor_id, a.depth + 1 AS depth
          FROM ancestors a
          INNER JOIN ${categories} c ON c.id = a.ancestor_id
          WHERE c.parent_id IS NOT NULL
            AND a.depth < ${MAX_CATEGORY_DEPTH}
        )
        SELECT ancestor_id, depth FROM ancestors
      `);

      for (const row of ancestors.rows) {
        if (row.ancestor_id === currentId) {
          throw new ConflictError('Category hierarchy cycle detected');
        }
      }

      // Check if we hit the depth limit (indicates potential existing cycle or excessive depth)
      const maxDepth = ancestors.rows.reduce((max, r) => Math.max(max, r.depth), 0);
      if (maxDepth >= MAX_CATEGORY_DEPTH) {
        throw new ConflictError('Category hierarchy exceeds maximum depth');
      }
    }
  }
}

export const categoryService = new CategoryService();
