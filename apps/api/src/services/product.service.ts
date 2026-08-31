import {
  db,
  products,
  productVariants,
  productCategories,
  productImages,
  categories,
  eq,
  isNull,
  and,
  or,
  asc,
  sql,
  inArray,
  SQL,
} from '@wellness/db';
import { NotFoundError, ConflictError } from '@wellness/utils';

import { toProductMutationDTO, toVariantDTO, toProductImageDTO } from './product.mapper';

export class ProductService {
  /**
   * Assert a product exists and is not soft-deleted.
   * Works with both the main db connection and a transaction.
   */
  private async assertProductExists(
    executor: { select: typeof db.select },
    productId: string,
  ): Promise<void> {
    const [product] = await executor
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)));
    if (!product) throw new NotFoundError('Product not found');
  }

  async getPublicProducts(limit = 20, cursor?: { createdAt: Date; id: string }) {
    let whereClause: SQL | undefined = and(
      eq(products.status, 'active'),
      isNull(products.deletedAt),
    );
    if (cursor) {
      if (isNaN(cursor.createdAt.getTime())) {
        throw new Error('Invalid cursor date');
      }
      whereClause = and(
        whereClause,
        or(
          sql`${products.createdAt} < ${cursor.createdAt}`,
          and(eq(products.createdAt, cursor.createdAt), sql`${products.id} < ${cursor.id}`),
        ),
      );
    }

    const items = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        brand: products.brand,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(whereClause)
      .orderBy(sql`${products.createdAt} DESC`, sql`${products.id} DESC`)
      .limit(limit);

    let nextCursor: string | null = null;
    if (items.length === limit) {
      const lastItem = items[items.length - 1];
      if (!lastItem) throw new Error('Unreachable');
      nextCursor = Buffer.from(
        JSON.stringify({ createdAt: lastItem.createdAt, id: lastItem.id }),
      ).toString('base64');
    }

    if (items.length === 0) {
      return { items: [], nextCursor, hasMore: false };
    }

    const productIds = items.map((i) => i.id);

    const images = await db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

    const imageMap = new Map(images.map((img) => [img.productId, img.url]));

    const allVariants = await db
      .select({
        productId: productVariants.productId,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
      })
      .from(productVariants)
      .where(
        and(
          inArray(productVariants.productId, productIds),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      );

    const mappedItems = items.map((item) => {
      const itemVariants = allVariants.filter((v) => v.productId === item.id);
      let startingPrice: number | null = null;
      let compareAtPrice: number | null = null;

      if (itemVariants.length > 0) {
        startingPrice = Math.min(...itemVariants.map((v) => Number(v.price)));
        const cheapestVariant = itemVariants.find((v) => Number(v.price) === startingPrice);
        compareAtPrice = cheapestVariant?.compareAtPrice
          ? Number(cheapestVariant.compareAtPrice)
          : null;
      }

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        brand: item.brand,
        primaryImage: imageMap.get(item.id) ?? null,
        startingPrice,
        compareAtPrice,
        isFeatured: item.isFeatured,
      };
    });

    return { items: mappedItems, nextCursor, hasMore: !!nextCursor };
  }

  async getProductBySlug(slug: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(eq(products.slug, slug), eq(products.status, 'active'), isNull(products.deletedAt)),
      )
      .limit(1);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Explicit fetching of variants to avoid implicit N+1 via drizzle 'with'
    const variants = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.isActive, true),
          isNull(productVariants.deletedAt),
        ),
      );
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder));

    // Explicit fetching of categories via join
    const productCategoryData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(
        and(
          eq(productCategories.productId, product.id),
          isNull(categories.deletedAt),
          eq(categories.isActive, true),
        ),
      );

    return {
      ...toProductMutationDTO(product),
      variants: variants.map(toVariantDTO),
      images: images.map(toProductImageDTO),
      categories: productCategoryData,
    };
  }

  async createProduct(
    data: typeof products.$inferInsert & { categoryIds?: string[] },
    userId: string,
  ) {
    return db.transaction(async (tx) => {
      // 1. Create Core Product
      const { categoryIds, ...productData } = data;
      const [newProduct] = await tx
        .insert(products)
        .values({
          ...productData,
          status: productData.status || 'draft',
          isFeatured: productData.isFeatured || false,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      if (!newProduct) {
        throw new Error('Failed to create product');
      }

      // 2. Link Categories if provided
      if (categoryIds && categoryIds.length > 0) {
        const uniqueIds = [...new Set(categoryIds)];
        const categoryLinks = uniqueIds.map((cId: string) => ({
          productId: newProduct.id,
          categoryId: cId,
        }));
        await tx.insert(productCategories).values(categoryLinks);
      }

      return toProductMutationDTO(newProduct);
    });
  }

  async updateProduct(
    id: string,
    data: Partial<typeof products.$inferInsert> & { categoryIds?: string[] },
    userId: string,
  ) {
    try {
      return await db.transaction(async (tx) => {
        const { categoryIds, ...productData } = data;

        const [product] = await tx
          .update(products)
          .set({
            ...productData,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(eq(products.id, id), isNull(products.deletedAt)))
          .returning();

        if (!product) {
          throw new NotFoundError('Product not found');
        }

        if (categoryIds !== undefined) {
          await tx.delete(productCategories).where(eq(productCategories.productId, id));
          if (categoryIds.length > 0) {
            const links = categoryIds.map((cId: string) => ({
              productId: id,
              categoryId: cId,
            }));
            await tx.insert(productCategories).values(links);
          }
        }

        return toProductMutationDTO(product);
      });
    } catch (error: unknown) {
      // Map PostgreSQL unique violation to ConflictError
      if (this.isPostgresError(error, '23505')) {
        throw new ConflictError('A product with this slug already exists');
      }
      throw error;
    }
  }

  async deleteProduct(id: string) {
    const [product] = await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning();

    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return toProductMutationDTO(product);
  }

  // Categories Assignment
  async updateProductCategories(
    productId: string,
    categoryIds: string[],
    primaryCategoryId?: string,
    userId?: string,
  ) {
    return db.transaction(async (tx) => {
      // 0. Validate primary category belongs to assigned categories before modifying DB
      if (primaryCategoryId) {
        if (!categoryIds.includes(primaryCategoryId)) {
          throw new ConflictError('Primary category must be one of the assigned categories');
        }
      }

      // 1. Check if product exists and is not soft-deleted
      await this.assertProductExists(tx, productId);

      // 1.5. Validate all categories exist, are active, and not deleted
      if (categoryIds.length > 0) {
        const uniqueIds = [...new Set(categoryIds)];
        const validCategories = await tx
          .select({ id: categories.id })
          .from(categories)
          .where(
            and(
              inArray(categories.id, uniqueIds),
              eq(categories.isActive, true),
              isNull(categories.deletedAt),
            ),
          );

        if (validCategories.length !== uniqueIds.length) {
          throw new ConflictError('One or more categories are invalid, inactive, or deleted');
        }
      }

      // 2. Delete old assignments
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));

      // 3. Insert new ones
      if (categoryIds.length > 0) {
        const uniqueIds = [...new Set(categoryIds)];
        const links = uniqueIds.map((cId) => ({ productId, categoryId: cId }));
        await tx.insert(productCategories).values(links);
      }

      // 4. Update primary category + audit fields
      const updateSet: Record<string, unknown> = {
        categoryPrimaryId: primaryCategoryId ?? null,
      };
      if (userId) {
        updateSet.updatedBy = userId;
        updateSet.updatedAt = new Date();
      }
      await tx.update(products).set(updateSet).where(eq(products.id, productId));
    });
  }

  // Variants CRUD
  async addVariant(
    productId: string,
    data: Omit<typeof productVariants.$inferInsert, 'productId'>,
  ) {
    await this.assertProductExists(db, productId);

    const [variant] = await db
      .insert(productVariants)
      .values({
        ...data,
        productId,
      })
      .returning();
    if (!variant) throw new Error('Failed to create variant');
    return toVariantDTO(variant);
  }

  async updateVariant(
    productId: string,
    variantId: string,
    data: Partial<typeof productVariants.$inferInsert>,
  ) {
    await this.assertProductExists(db, productId);

    const [variant] = await db
      .update(productVariants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId),
          isNull(productVariants.deletedAt),
        ),
      )
      .returning();

    if (!variant) throw new NotFoundError('Variant not found or does not belong to product');
    return toVariantDTO(variant);
  }

  async deleteVariant(productId: string, variantId: string) {
    await this.assertProductExists(db, productId);

    const [variant] = await db
      .update(productVariants)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId),
          isNull(productVariants.deletedAt),
        ),
      )
      .returning();
    if (!variant) throw new NotFoundError('Variant not found or does not belong to product');
    return toVariantDTO(variant);
  }

  // Images CRUD
  async addProductImage(
    productId: string,
    data: Omit<typeof productImages.$inferInsert, 'productId'>,
  ) {
    return db.transaction(async (tx) => {
      // Check existence inside transaction to prevent writes after concurrent soft delete
      await this.assertProductExists(tx, productId);

      if (data.variantId) {
        const [variant] = await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(
            and(
              eq(productVariants.id, data.variantId),
              eq(productVariants.productId, productId),
              isNull(productVariants.deletedAt),
            ),
          );
        if (!variant) throw new ConflictError('Variant does not belong to product');
      }

      // If setting as primary, unset other primaries for this product
      if (data.isPrimary) {
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(
            and(
              eq(productImages.productId, productId),
              data.variantId
                ? eq(productImages.variantId, data.variantId)
                : isNull(productImages.variantId),
            ),
          );
      }

      const [image] = await tx
        .insert(productImages)
        .values({
          ...data,
          productId,
        })
        .returning();
      if (!image) throw new Error('Failed to create image');
      return toProductImageDTO(image);
    });
  }

  async updateProductImage(
    productId: string,
    imageId: string,
    data: Partial<typeof productImages.$inferInsert>,
  ) {
    return db.transaction(async (tx) => {
      // Check existence inside transaction to prevent writes after concurrent soft delete
      await this.assertProductExists(tx, productId);

      // Find the image to verify ownership
      const [existing] = await tx
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));

      if (!existing) throw new NotFoundError('Image not found or does not belong to product');

      // If setting as primary, unset other primaries for this product
      if (data.isPrimary) {
        const targetVariantId = data.variantId !== undefined ? data.variantId : existing.variantId;
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(
            and(
              eq(productImages.productId, productId),
              targetVariantId
                ? eq(productImages.variantId, targetVariantId)
                : isNull(productImages.variantId),
            ),
          );
      }

      const [image] = await tx
        .update(productImages)
        .set(data)
        .where(eq(productImages.id, imageId))
        .returning();
      if (!image) throw new Error('Failed to update image');
      return toProductImageDTO(image);
    });
  }

  async deleteProductImage(productId: string, imageId: string) {
    await this.assertProductExists(db, productId);

    const [image] = await db
      .delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
      .returning();
    if (!image) throw new NotFoundError('Image not found or does not belong to product');
    return toProductImageDTO(image);
  }

  /**
   * Check if an error is a PostgreSQL error with a specific code.
   */
  private isPostgresError(error: unknown, code: string): boolean {
    if (typeof error === 'object' && error !== null) {
      const err = error as { code?: string; cause?: { code?: string } };
      return err.code === code || err.cause?.code === code;
    }
    return false;
  }
}

export const productService = new ProductService();
