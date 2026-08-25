import { db, categories, productCategories, eq, isNull, and, asc, sql, inArray } from '@wellness/db';
import { NotFoundError, ConflictError } from '@wellness/utils';
import { CreateCategorySchema, UpdateCategorySchema } from '@wellness/validation';

export class CategoryService {
  async getPublicCategories() {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        parentId: categories.parentId,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        metadata: categories.metadata,
      })
      .from(categories)
      .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
      .orderBy(asc(categories.sortOrder));
  }

  async getCategoryBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), isNull(categories.deletedAt)))
      .limit(1);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category!;
  }
  async createCategory(data: any, userId: string) {
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
    return category!;
  }

  async updateCategory(id: string, data: any, userId: string) {
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
      .where(eq(categories.id, id))
      .returning();

    if (!category) throw new NotFoundError('Category not found');
    return category!;
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
      .where(eq(categories.id, id))
      .returning();

    if (!category) throw new NotFoundError('Category not found');
    return category!;
  }

  private async validateParentId(parentId: string, currentId?: string) {
    // Cycle detection logic
    let currentParent = parentId;
    while (currentParent) {
      if (currentId && currentParent === currentId) {
        throw new ConflictError('Category hierarchy cycle detected');
      }
      const [parent] = await db
        .select({ parentId: categories.parentId })
        .from(categories)
        .where(eq(categories.id, currentParent));
      if (!parent) break;
      currentParent = parent.parentId as string;
    }
  }
}

export const categoryService = new CategoryService();
