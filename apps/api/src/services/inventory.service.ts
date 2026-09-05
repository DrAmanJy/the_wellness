import { db, inventory, eq } from '@wellness/db';

export class InventoryService {
  async getInventory(productId: string) {
    const [inv] = await db.select().from(inventory).where(eq(inventory.productId, productId));
    return inv || null;
  }
}

export const inventoryService = new InventoryService();
