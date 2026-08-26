import { JsonObject } from './common';

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  metadata: JsonObject | null;
};
