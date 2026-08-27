import { db, inventory, eq } from '@wellness/db';
export class InventoryService {
  async getInventory(variantId: string) {
    const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, variantId));
    return inv || null;
  }
}

export const inventoryService = new InventoryService();
