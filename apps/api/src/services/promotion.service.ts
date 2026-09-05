import type { PromotionDTO } from '@wellness/contracts';
import { db, promotions, eq, desc, asc } from '@wellness/db';
import { NotFoundError } from '@wellness/utils';
import type { CreatePromotionInput, UpdatePromotionInput } from '@wellness/validation';

function toPromotionDTO(row: typeof promotions.$inferSelect): PromotionDTO {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    targetUrl: row.targetUrl,
    discountText: row.discountText,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PromotionService {
  async getPromotions(activeOnly = false): Promise<PromotionDTO[]> {
    const query = activeOnly
      ? db
          .select()
          .from(promotions)
          .where(eq(promotions.isActive, true))
          .orderBy(asc(promotions.displayOrder), desc(promotions.createdAt))
      : db
          .select()
          .from(promotions)
          .orderBy(asc(promotions.displayOrder), desc(promotions.createdAt));

    const rows = await query;
    return rows.map(toPromotionDTO);
  }

  async getPromotionById(id: string): Promise<PromotionDTO> {
    const [row] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
    if (!row) {
      throw new NotFoundError(`Promotion banner with ID ${id} not found`);
    }
    return toPromotionDTO(row);
  }

  async createPromotion(input: CreatePromotionInput): Promise<PromotionDTO> {
    const [created] = await db
      .insert(promotions)
      .values({
        title: input.title,
        description: input.description || null,
        imageUrl: input.imageUrl,
        targetUrl: input.targetUrl || '/products',
        discountText: input.discountText || null,
        isActive: input.isActive,
        displayOrder: input.displayOrder,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create promotion banner record');
    }

    return toPromotionDTO(created);
  }

  async updatePromotion(id: string, input: UpdatePromotionInput): Promise<PromotionDTO> {
    await this.getPromotionById(id);

    const [updated] = await db
      .update(promotions)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.targetUrl !== undefined ? { targetUrl: input.targetUrl } : {}),
        ...(input.discountText !== undefined ? { discountText: input.discountText } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
        updatedAt: new Date(),
      })
      .where(eq(promotions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError(`Promotion banner with ID ${id} not found`);
    }

    return toPromotionDTO(updated);
  }

  async togglePromotionStatus(id: string): Promise<PromotionDTO> {
    const existing = await this.getPromotionById(id);
    return this.updatePromotion(id, { isActive: !existing.isActive });
  }

  async deletePromotion(id: string): Promise<{ success: boolean }> {
    await this.getPromotionById(id);
    await db.delete(promotions).where(eq(promotions.id, id));
    return { success: true };
  }
}

export const promotionService = new PromotionService();
