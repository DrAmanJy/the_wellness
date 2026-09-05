import { db, categories, eq, asc } from '@wellness/db';
import { NotFoundError, ConflictError } from '@wellness/utils';

import { toCategoryListDTO, toCategoryDetailDTO, toCategoryMutationDTO } from './category.mapper';

export class CategoryService {
  async getPublicCategories() {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name));

    return results.map(toCategoryListDTO);
  }

  async getCategoryBySlug(slug: string) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return toCategoryDetailDTO(category);
  }

  async getCategoryById(id: string) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return toCategoryDetailDTO(category);
  }

  async createCategory(data: typeof categories.$inferInsert, _userId?: string) {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .limit(1);

    if (existing) {
      throw new ConflictError('Category slug already exists');
    }

    const [category] = await db.insert(categories).values(data).returning();

    if (!category) throw new Error('Failed to create category');
    return toCategoryMutationDTO(category);
  }

  async updateCategory(
    id: string,
    data: Partial<typeof categories.$inferInsert>,
    _userId?: string,
  ) {
    const [category] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!category) throw new NotFoundError('Category not found');
    return toCategoryMutationDTO(category);
  }

  async deleteCategory(id: string) {
    const [category] = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (!category) throw new NotFoundError('Category not found');
    return toCategoryMutationDTO(category);
  }
}

export const categoryService = new CategoryService();
