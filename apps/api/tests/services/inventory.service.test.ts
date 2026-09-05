import { describe, it, expect } from 'vitest';

import { inventoryService } from '../../src/services/inventory.service';

describe('InventoryService', () => {
  it('returns null for non-existent product inventory', async () => {
    const inv = await inventoryService.getInventory('00000000-0000-0000-0000-000000000000');
    expect(inv).toBeNull();
  });
});
