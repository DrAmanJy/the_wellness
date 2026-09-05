import {
  db,
  products,
  productImages,
  inventory,
  categories,
  eq,
  and,
  asc,
  count,
} from '@wellness/db';
import { NotFoundError, BadRequestError } from '@wellness/utils';

import { cloudinaryService } from './cloudinary.service';
import {
  toProductMutationDTO,
  toProductDetailDTO,
  toProductListDTO,
  toProductImageDTO,
} from './product.mapper';

function formatPrice(val: unknown): string {
  if (typeof val === 'number') {
    return val.toFixed(2);
  }
  if (typeof val === 'string' && val.trim() !== '') {
    return val;
  }
  return '0.00';
}

export class ProductService {
  async getPublicProducts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        product: products,
        categoryName: categories.name,
        availableQty: inventory.availableQty,
        reservedQty: inventory.reservedQty,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .limit(limit)
      .offset(offset);

    const [totalCountResult] = await db.select({ count: count() }).from(products);

    const totalItems = totalCountResult?.count ?? 0;

    const items = await Promise.all(
      rows.map(async ({ product, categoryName, availableQty, reservedQty }) => {
        const imgs = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

        return {
          ...toProductListDTO(product, imgs, categoryName),
          inventoryQty: availableQty ?? product.stockQty,
          availableQty: availableQty ?? product.stockQty,
          reservedQty: reservedQty ?? 0,
        };
      }),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getProductById(id: string) {
    const [row] = await db
      .select({
        product: products,
        categoryName: categories.name,
        availableQty: inventory.availableQty,
        reservedQty: inventory.reservedQty,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(eq(products.id, id))
      .limit(1);

    if (!row) throw new NotFoundError('Product not found');

    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

    return {
      ...toProductDetailDTO(row.product, imgs, row.categoryName),
      inventoryQty: row.availableQty ?? row.product.stockQty,
      availableQty: row.availableQty ?? row.product.stockQty,
      reservedQty: row.reservedQty ?? 0,
    };
  }

  async createProduct(
    data: typeof products.$inferInsert & {
      inventoryQty?: number | undefined;
      availableQty?: number | undefined;
      reservedQty?: number | undefined;
      images?: string[] | undefined;
      image?: string | undefined;
    },
    _userId?: string,
  ) {
    const { inventoryQty, availableQty, reservedQty, images, image, ...productData } = data;
    const stockQty = productData.stockQty ?? 0;
    const invQty = availableQty ?? inventoryQty ?? stockQty;
    const resvQty = reservedQty ?? 0;

    if (stockQty > invQty) {
      throw new BadRequestError(
        'Product stock quantity cannot be greater than total inventory quantity',
      );
    }

    const initialStockStatus =
      stockQty <= 0 || invQty <= 0 ? 'out_of_stock' : (productData.stockStatus ?? 'in_stock');

    const sellingPrice = formatPrice(productData.sellingPrice);
    const mrp = formatPrice(productData.mrp);

    const rawImgs = Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];
    const cleanImgs = rawImgs.filter(
      (u): u is string => typeof u === 'string' && u.trim().length > 0,
    );

    if (cleanImgs.length < 2) {
      throw new BadRequestError('At least 2 product images are required to create a product.');
    }

    // 1. Upload images to Cloudinary before DB transaction
    const uploadedImgUrls = await cloudinaryService.uploadMultipleImages(cleanImgs);
    if (uploadedImgUrls.length < 2) {
      throw new BadRequestError(
        'Failed to upload at least 2 product images to Cloudinary. Transaction revoked.',
      );
    }

    // 2. Perform DB creation inside a transaction.
    // If product image insertion fails or any step errors out, the transaction rolls back (revokes everything).
    return await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          ...productData,
          stockQty,
          stockStatus: initialStockStatus,
          sellingPrice,
          mrp,
        })
        .returning();

      if (!product) {
        throw new Error('Failed to create product record');
      }

      // Add inventory record
      await tx
        .insert(inventory)
        .values({
          productId: product.id,
          availableQty: invQty,
          reservedQty: resvQty,
        })
        .onConflictDoUpdate({
          target: [inventory.productId],
          set: { availableQty: invQty, reservedQty: resvQty, updatedAt: new Date() },
        });

      // Insert product images into product_image table
      const recordsToInsert = uploadedImgUrls.map((url, idx) => ({
        productId: product.id,
        url,
        displayOrder: idx,
        isPrimary: idx === 0,
      }));
      const insertedImages = await tx.insert(productImages).values(recordsToInsert).returning();
      if (insertedImages.length < 2) {
        throw new BadRequestError(
          'Failed to insert product images into product_image table. At least 2 images required. Transaction revoked.',
        );
      }

      const imgs = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

      return {
        ...toProductMutationDTO(product, imgs),
        inventoryQty: invQty,
        availableQty: invQty,
        reservedQty: resvQty,
      };
    });
  }

  async updateProduct(
    id: string,
    data: Partial<typeof products.$inferInsert> & {
      inventoryQty?: number | undefined;
      availableQty?: number | undefined;
      reservedQty?: number | undefined;
      images?: string[] | undefined;
      image?: string | undefined;
    },
    _userId?: string,
  ) {
    const { inventoryQty, availableQty, reservedQty, images, image, ...productData } = data;

    const [existingProduct] = await db.select().from(products).where(eq(products.id, id)).limit(1);

    if (!existingProduct) throw new NotFoundError('Product not found');

    const newStockQty = productData.stockQty ?? existingProduct.stockQty;

    let targetInvQty = availableQty ?? inventoryQty;
    let targetResvQty = reservedQty;

    const [existingInv] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, id))
      .limit(1);

    if (targetInvQty === undefined) {
      targetInvQty = existingInv?.availableQty ?? newStockQty;
    }
    if (targetResvQty === undefined) {
      targetResvQty = existingInv?.reservedQty ?? 0;
    }

    if (newStockQty > targetInvQty) {
      throw new BadRequestError(
        'Product stock quantity cannot be greater than total inventory quantity',
      );
    }

    let nextStockStatus = productData.stockStatus ?? existingProduct.stockStatus;
    if (nextStockStatus !== 'discontinued') {
      if (newStockQty <= 0 || targetInvQty <= 0) {
        nextStockStatus = 'out_of_stock';
      } else if (nextStockStatus === 'out_of_stock' && newStockQty > 0 && targetInvQty > 0) {
        nextStockStatus = 'in_stock';
      }
    }

    const setValues: Record<string, unknown> = {
      ...productData,
      stockQty: newStockQty,
      stockStatus: nextStockStatus,
      lastUpdated: new Date(),
    };

    let uploadedImgUrls: string[] = [];
    if (images !== undefined || image !== undefined) {
      const rawImgs = Array.isArray(images) && images.length > 0 ? images : image ? [image] : [];
      const cleanImgs = rawImgs.filter(
        (u): u is string => typeof u === 'string' && u.trim().length > 0,
      );
      if (cleanImgs.length > 0) {
        uploadedImgUrls = await cloudinaryService.uploadMultipleImages(cleanImgs);
      }
    }

    return await db.transaction(async (tx) => {
      const [product] = await tx
        .update(products)
        .set(setValues)
        .where(eq(products.id, id))
        .returning();

      if (!product) throw new NotFoundError('Product not found');

      if (uploadedImgUrls.length > 0) {
        const existingImages = await tx
          .select()
          .from(productImages)
          .where(eq(productImages.productId, id));

        const recordsToInsert = uploadedImgUrls.map((url, idx) => ({
          productId: id,
          url,
          displayOrder: existingImages.length + idx,
          isPrimary: existingImages.length === 0 && idx === 0,
        }));
        await tx.insert(productImages).values(recordsToInsert);
      }

      if (inventoryQty !== undefined || availableQty !== undefined || reservedQty !== undefined) {
        await tx
          .insert(inventory)
          .values({
            productId: id,
            availableQty: targetInvQty,
            reservedQty: targetResvQty,
          })
          .onConflictDoUpdate({
            target: [inventory.productId],
            set: { availableQty: targetInvQty, reservedQty: targetResvQty, updatedAt: new Date() },
          });
      }

      const imgs = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

      return {
        ...toProductMutationDTO(product, imgs),
        inventoryQty: targetInvQty,
        availableQty: targetInvQty,
        reservedQty: targetResvQty,
      };
    });
  }

  async deleteProduct(id: string) {
    const [product] = await db.delete(products).where(eq(products.id, id)).returning();

    if (!product) throw new NotFoundError('Product not found');
    return toProductMutationDTO(product, []);
  }

  async getProductImages(productId: string) {
    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

    return imgs.map(toProductImageDTO);
  }

  async addProductImages(
    productId: string,
    imagesData: Array<{
      url: string;
      altText?: string | undefined;
      isPrimary?: boolean | undefined;
    }>,
  ) {
    const uploadedImages = await Promise.all(
      imagesData.map(async (img) => {
        const uploadedUrl = await cloudinaryService.uploadImage(img.url);
        return {
          ...img,
          url: uploadedUrl,
        };
      }),
    );

    return await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!product) throw new NotFoundError('Product not found');

      const existingImages = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId));

      const startOrder = existingImages.length;

      const recordsToInsert = uploadedImages.map((img, idx) => ({
        productId,
        url: img.url,
        altText: img.altText ?? null,
        displayOrder: startOrder + idx,
        isPrimary: img.isPrimary ?? (existingImages.length === 0 && idx === 0),
      }));

      const inserted = await tx.insert(productImages).values(recordsToInsert).returning();
      if (inserted.length === 0) {
        throw new BadRequestError('Failed to insert product images into product_image table');
      }

      const imgs = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

      return imgs.map(toProductImageDTO);
    });
  }

  async reorderProductImages(
    productId: string,
    imageOrders: Array<{ id: string; displayOrder: number }>,
  ) {
    return await db.transaction(async (tx) => {
      const [product] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!product) throw new NotFoundError('Product not found');

      for (const item of imageOrders) {
        await tx
          .update(productImages)
          .set({
            displayOrder: item.displayOrder,
            isPrimary: item.displayOrder === 0,
            updatedAt: new Date(),
          })
          .where(and(eq(productImages.id, item.id), eq(productImages.productId, productId)));
      }

      const imgs = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.displayOrder), asc(productImages.createdAt));

      return imgs.map(toProductImageDTO);
    });
  }

  async deleteProductImage(productId: string, imageId: string) {
    const [deleted] = await db
      .delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
      .returning();

    if (!deleted) throw new NotFoundError('Product image not found');
    return { success: true };
  }
}

export const productService = new ProductService();
