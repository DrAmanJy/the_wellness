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
  asc,
  sql,
  inArray,
} from '@wellness/db';
import { NotFoundError, ConflictError } from '@wellness/utils';

export class ProductService {
  async getPublicProducts(limit = 20, cursor?: Date) {
    let whereClause = and(eq(products.status, 'active'), isNull(products.deletedAt));
    if (cursor) {
      whereClause = and(whereClause, sql`${products.createdAt} < ${cursor}`);
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
      .orderBy(sql`${products.createdAt} DESC`)
      .limit(limit);

    const nextCursor = items.length === limit ? (items[items.length - 1]?.createdAt ?? null) : null;

    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getProductBySlug(slug: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, 'active'), isNull(products.deletedAt)))
      .limit(1);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Explicit fetching of variants to avoid implicit N+1 via drizzle 'with'
    const variants = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), isNull(productVariants.deletedAt)));
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
      .where(eq(productCategories.productId, product.id));

    return {
      ...product,
      variants,
      images,
      categories: productCategoryData,
    };
  }

  async createProduct(data: any, userId: string) {
    return db.transaction(async (tx) => {
      // 1. Create Core Product
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          brand: data.brand,
          status: data.status || 'draft',
          isFeatured: data.isFeatured || false,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      if (!newProduct) {
        throw new Error('Failed to create product');
      }

      // 2. Link Categories if provided
      if (data.categoryIds && data.categoryIds.length > 0) {
        const categoryLinks = data.categoryIds.map((cId: string) => ({
          productId: newProduct.id,
          categoryId: cId,
        }));
        await tx.insert(productCategories).values(categoryLinks);
      }

      return newProduct!;
    });
  }

  async updateProduct(id: string, data: any, userId: string) {
    const [product] = await db
      .update(products)
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product!;
  }

  async deleteProduct(id: string) {
    const [product] = await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product!;
  }

  // Categories Assignment
  async updateProductCategories(
    productId: string,
    categoryIds: string[],
    primaryCategoryId?: string,
  ) {
    return db.transaction(async (tx) => {
      // 1. Delete old assignments
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));

      // 2. Insert new ones
      if (categoryIds.length > 0) {
        const links = categoryIds.map((cId) => ({ productId, categoryId: cId }));
        await tx.insert(productCategories).values(links);
      }

      // 3. Update primary category and validate
      if (primaryCategoryId) {
        if (!categoryIds.includes(primaryCategoryId)) {
          throw new ConflictError('Primary category must be one of the assigned categories');
        }
        await tx
          .update(products)
          .set({ categoryPrimaryId: primaryCategoryId })
          .where(eq(products.id, productId));
      }
    });
  }

  // Variants CRUD
  async addVariant(productId: string, data: any) {
    const [variant] = await db
      .insert(productVariants)
      .values({
        ...data,
        productId,
      })
      .returning();
    return variant!;
  }

  async updateVariant(variantId: string, data: any) {
    const [variant] = await db
      .update(productVariants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, variantId))
      .returning();

    if (!variant) throw new NotFoundError('Variant not found');
    return variant!;
  }

  async deleteVariant(variantId: string) {
    const [variant] = await db
      .update(productVariants)
      .set({ deletedAt: new Date() })
      .where(eq(productVariants.id, variantId))
      .returning();
    if (!variant) throw new NotFoundError('Variant not found');
    return variant!;
  }

  // Images CRUD
  async addProductImage(productId: string, data: any) {
    return db.transaction(async (tx) => {
      // If setting as primary, unset other primaries for this product
      if (data.isPrimary) {
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.productId, productId));
      }

      const [image] = await tx
        .insert(productImages)
        .values({
          ...data,
          productId,
        })
        .returning();
      return image!;
    });
  }

  async updateProductImage(imageId: string, data: any) {
    return db.transaction(async (tx) => {
      // First find the image to know its productId
      const [existing] = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.id, imageId));
        
      if (!existing) throw new NotFoundError('Image not found');

      // If setting as primary, unset other primaries for this product
      if (data.isPrimary) {
        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.productId, existing.productId));
      }

      const [image] = await tx
        .update(productImages)
        .set(data)
        .where(eq(productImages.id, imageId))
        .returning();
      return image!;
    });
  }

  async deleteProductImage(imageId: string) {
    const [image] = await db
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning();
    if (!image) throw new NotFoundError('Image not found');
    return image!;
  }
}

export const productService = new ProductService();
